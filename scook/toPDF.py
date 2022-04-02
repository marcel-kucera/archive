from PIL import Image
from glob import glob

files = glob(("./imgs/*.png"))
imgs = []
for img in files:
    imgs.append(Image.open(img).convert("RGB"))
rootImg = imgs[0]
imgs.pop(0)
rootImg.save("out.pdf","PDF", append_images=imgs, save_all=True)