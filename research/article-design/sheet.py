import sys,glob,os
from PIL import Image, ImageDraw
d, tw, cols, per = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
fs=sorted(glob.glob(d+'/*.jpg'))
for s in range(0,len(fs),per):
    chunk=fs[s:s+per]; im0=Image.open(chunk[0]); th=int(im0.height*tw/im0.width)
    rows=(len(chunk)+cols-1)//cols
    S=Image.new('RGB',(cols*tw,rows*th),'white'); D=ImageDraw.Draw(S)
    for k,f in enumerate(chunk):
        im=Image.open(f).resize((tw,th)); x,y=(k%cols)*tw,(k//cols)*th
        S.paste(im,(x,y)); D.rectangle([x,y,x+34,y+16],fill='red'); D.text((x+3,y+2),os.path.basename(f)[:3],fill='white')
        D.rectangle([x,y,x+tw-1,y+th-1],outline='red')
    S.save(f'{d}_sheet{s//per}.jpg',quality=70)
    print(f'{d}_sheet{s//per}.jpg')
