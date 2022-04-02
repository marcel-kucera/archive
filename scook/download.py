import requests
from PIL import Image
import io

### User Config ###
imageTokenValue = "SFMyNTY.g2gDYQN0AAAAAm0AAAALZG9jdW1lbnRfaWRtAAAADTk3ODMwNjEyMTEzNDltAAAABWxheWVybQAAAFVAITM4QzQuNjU5Ri44MDAwLjNBNzkhMDAwMSE3RjEyLjAzRTMhMDAwMCFBRkJFLkNFN0MuOTRFMi42RDBGXzIyMDA1MzY4OV85NzgzMDYxMjExMzQ5YmI9HWw.BWpFa5jxxzjT0wVH6sosSr6A9OV6qb0baRKuEo-Ycyo"
baseUrl = "https://uma20-pspdfkit.prod.aws.cornelsen.de/i/d/9783061211349/h/g1AAAACheJwVzDsSwyAMRVFPdsIGGAnx0evsOLCD1B4RzKTJ_tvY3bnN_T5-y7K8Vye6R58Tmlci8rIVuAvsSuPgSarcSW5rz-r3WnaPWIPPL2pHCERJsuJAUaHMgVki7vOKBKbTRh8fmxxtMAqdXTAKzR4MFy1hjDSjmgIpkphBTmXV2f8RSiX2/"

totalWidth = round(3232/4)
totalHeight = round(4423/4)

###################

# Static Data
imageTokenName = "X-PSPDFKit-Image-Token"


# Setup requests
sess = requests.session()
sess.headers.update({imageTokenName:imageTokenValue})


# Run until error
currentPage = 0
while True:
    # Build url
    extUrlFormat = "page-{}-dimensions-{}-{}-tile-0-0-{}-{}".format(currentPage,totalWidth,totalHeight,totalWidth,totalHeight)

    # Get image
    res = sess.get(baseUrl+extUrlFormat,stream=True)
    if res.status_code != 200:
        print(res.status_code)
        print(res.content)
        break

    # Save Image in buffer
    buf = io.BytesIO(res.content)

    # Crop Image
    img = Image.open(buf)
    area = (0, 0, totalWidth, totalHeight)
    img = img.crop(area)
        
    #Saved in cropped and converted
    img.save("./imgs/{}.png".format(currentPage))
    print("Downloaded Page {}".format(currentPage))
    currentPage = currentPage+1