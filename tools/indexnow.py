"""Tell Bing (and other IndexNow engines: Yandex, Seznam, Naver) about every page in the sitemap.

Run AFTER a deploy is live:   python tools/indexnow.py
The key file /2e20a9afd95d408484bdcbffdf81860b.txt must stay in the site root; it proves we own the domain.
Google does not use IndexNow; for Google use Search Console (sitemap + URL inspection).
"""
import json, re, urllib.request, os

SITE = "https://beyondtheshift.co.uk"
KEY = "2e20a9afd95d408484bdcbffdf81860b"
ROOT = os.path.join(os.path.dirname(__file__), "..", "autumn-training-series")

urls = re.findall(r"<loc>(.*?)</loc>", open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read())
body = json.dumps({"host": "beyondtheshift.co.uk", "key": KEY,
                   "keyLocation": f"{SITE}/{KEY}.txt", "urlList": urls}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                             headers={"Content-Type": "application/json; charset=utf-8"})
with urllib.request.urlopen(req) as r:
    print(r.status, f"submitted {len(urls)} URLs")  # 200/202 = accepted
