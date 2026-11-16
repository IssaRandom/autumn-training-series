"""Scroll a page end to end at a given width, screenshot each step, log structure per step.
usage: python scrollcap.py URL OUTDIR WIDTH HEIGHT [step_fraction] [mid]
  mid: wheel quickly (no screenshots) to ~0.3 of the page, then capture until ~0.7 (max 50 frames).
       Frames are still numbered from 000; log.json has 'mode': 'mid' and each frame's y.
Also logs (13 Nov, Phase 1b): bytes transferred (CDP encodedDataLength, cross-origin included) at load and
at the end, and how many CSS/JS responses mention prefers-reduced-motion. Set SCROLLCAP_RM=1 to run with
reduced motion emulated.
"""
import sys, json, os, time
from playwright.sync_api import sync_playwright

url, out, W, H = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
frac = float(sys.argv[5]) if len(sys.argv) > 5 else 0.8
mid = len(sys.argv) > 6 and sys.argv[6] == 'mid'
os.makedirs(out, exist_ok=True)

PROBE = r"""
() => {
  const vh = innerHeight, vw = innerWidth;
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh && r.width > 0 && r.height > 0; };
  const desc = el => {
    const r = el.getBoundingClientRect();
    return (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0,3).join('.') : '')).slice(0,90)
      + ` [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}]`;
  };
  const all = [...document.querySelectorAll('body *')];
  const sticky = [], fixed = [], anim = [];
  for (const el of all) {
    if (!inView(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'sticky') sticky.push(desc(el));
    else if (cs.position === 'fixed' && el.getBoundingClientRect().height > 40) fixed.push(desc(el));
    if (cs.animationTimeline && cs.animationTimeline !== 'auto') anim.push('timeline:' + cs.animationTimeline + ' ' + desc(el));
  }
  const vids = [...document.querySelectorAll('video')].filter(inView).map(v => desc(v) + (v.paused ? ' paused' : ' playing') + (v.loop ? ' loop' : '') + (v.muted ? ' muted' : ''));
  const imgs = [...document.querySelectorAll('img,picture,canvas,svg')].filter(inView).filter(e => e.getBoundingClientRect().width > vw*0.5).map(desc).slice(0,4);
  // visible text blocks
  const paras = [...document.querySelectorAll('p,h1,h2,h3,blockquote,figcaption')].filter(inView);
  const text = paras.map(p => p.tagName + ':' + p.textContent.trim().slice(0,70)).slice(0,6);
  const textChars = paras.reduce((n,p)=>n+p.textContent.trim().length,0);
  const fonts = [...new Set(paras.slice(0,4).map(p => { const c=getComputedStyle(p); return p.tagName+' '+c.fontFamily.split(',')[0]+' '+c.fontSize+'/'+c.lineHeight+' w'+c.fontWeight+' mw'+Math.round(p.getBoundingClientRect().width); }))];
  const bg = getComputedStyle(document.elementFromPoint(vw/2, vh/2) || document.body).backgroundColor;
  return { y: scrollY, docH: document.documentElement.scrollHeight, sticky: sticky.slice(0,6), fixed: fixed.slice(0,4), anim: anim.slice(0,4), vids, imgs, text, textChars, fonts, bg };
}
"""

GLOBAL = r"""
() => {
  const libs = {};
  for (const k of ['gsap','ScrollTrigger','Lenis','lottie','bodymovin','THREE','scrollama','Swiper','mapboxgl','d3','React','__NEXT_DATA__','Squarespace','Static']) if (window[k]) libs[k]=true;
  const scripts = [...document.scripts].map(s=>s.src).filter(Boolean).map(s=>s.split('?')[0].split('/').slice(-2).join('/')).slice(0,60);
  let sdtl = 0, kf = 0;
  try { for (const ss of document.styleSheets) { try { for (const r of ss.cssRules) { const t=r.cssText; if (/animation-timeline|view-timeline|scroll-timeline/.test(t)) sdtl++; if (r.type===7) kf++; } } catch(e){} } } catch(e){}
  return { title: document.title, libs, scripts, scrollDrivenRules: sdtl, keyframes: kf,
           sections: document.querySelectorAll('section').length, videos: document.querySelectorAll('video').length,
           imgs: document.images.length, words: document.body.innerText.split(/\s+/).length,
           htmlScroll: getComputedStyle(document.documentElement).scrollBehavior,
           anchors: document.querySelectorAll('a[href^="#"]').length,
           h2: document.querySelectorAll('h2').length,
           progress: document.querySelectorAll('[role=progressbar],progress,[class*=progress],[id*=progress]').length,
           generator: (document.querySelector('meta[name=generator]')||{}).content || '',
           shorthand: !!document.querySelector('[class*="Theme-"],[class*="shorthand"],[id*="shorthand"]') || /shorthand/i.test(document.documentElement.outerHTML.slice(0,200000)) };
}
"""

with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    mobile = W < 600
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1,
                        reduced_motion=('reduce' if os.environ.get('SCROLLCAP_RM') else 'no-preference'),
                        is_mobile=mobile, has_touch=mobile,
                        user_agent=('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' if mobile else
                                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'))
    pg = ctx.new_page()
    net = {'bytes': 0, 'reqs': 0, 'rm_files': [], 'rm_hits': 0}
    try:
        cdp = ctx.new_cdp_session(pg); cdp.send('Network.enable')
        def _fin(e): net['bytes'] += e.get('encodedDataLength', 0); net['reqs'] += 1
        cdp.on('Network.loadingFinished', _fin)
    except Exception: pass
    def _resp(r):
        try:
            if r.request.resource_type in ('stylesheet', 'script'):
                t = r.text()
                n = t.count('prefers-reduced-motion')
                if n: net['rm_hits'] += n; net['rm_files'].append(r.url.split('?')[0][-80:])
        except Exception: pass
    pg.on('response', _resp)
    pg.goto(url, wait_until='domcontentloaded', timeout=60000)
    time.sleep(3)
    # dismiss common consent banners
    for sel in ['#onetrust-reject-all-handler', 'button:has-text("Reject All")', 'button:has-text("Decline")', 'button:has-text("Accept")']:
        try:
            el = pg.locator(sel).first
            if el.is_visible(timeout=500): el.click(timeout=1500); time.sleep(1); break
        except Exception: pass
    log = {'url': url, 'w': W, 'h': H, 'global': pg.evaluate(GLOBAL), 'frames': []}
    log['load_bytes'] = net['bytes']
    log['mode'] = 'mid' if mid else 'full'
    i, last_y, stuck = 0, -1, 0
    max_frames, stop_y = 140, None
    if mid:
        max_frames = 50
        docH = pg.evaluate('document.documentElement.scrollHeight')
        target = 0.3 * docH; tries = 0
        # real wheel steps so scroll-linked effects and lazy loads still run, short sleeps, no screenshots
        while pg.evaluate('scrollY') < target and tries < 400:
            pg.mouse.wheel(0, H * 0.5); time.sleep(0.12); tries += 1
            docH = pg.evaluate('document.documentElement.scrollHeight'); target = 0.3 * docH
        time.sleep(0.6)
    while i < max_frames:
        info = pg.evaluate(PROBE)
        info['i'] = i
        pg.screenshot(path=f'{out}/{i:03d}.jpg', type='jpeg', quality=55)
        log['frames'].append(info)
        if info['y'] == last_y:
            stuck += 1
            if stuck >= 2: break
        else: stuck = 0
        last_y = info['y']
        if mid and info['y'] > 0.7 * info['docH']: break
        # smooth wheel scroll in small steps so scroll-linked effects run
        step = int(H * frac)
        for _ in range(8):
            pg.mouse.wheel(0, step / 8); time.sleep(0.08)
        time.sleep(0.6)
        i += 1
    log['total_bytes'] = net['bytes']; log['reqs'] = net['reqs']
    log['reduced_motion_hits'] = net['rm_hits']; log['reduced_motion_files'] = net['rm_files'][:10]
    log['reduced_motion_emulated'] = bool(os.environ.get('SCROLLCAP_RM'))
    json.dump(log, open(f'{out}/log.json', 'w'), indent=1)
    print('frames', len(log['frames']), 'docH', log['frames'][-1]['docH'], 'MB', round(net['bytes']/1e6, 1), 'rm', net['rm_hits'], json.dumps(log['global'])[:1500])
    b.close()
