# import module
from pdf2image import convert_from_path
# This extracts qr code from png file
from PyDIVOC.divoc_qr import decode_divoc_covid19_qr
 
# import sys
import sys
import json

# Taking args from bash script
directory = str(sys.argv[1])
 
# Store Pdf with convert_from_path function
images = convert_from_path('../' + directory)
 
for i in range(len(images)):
   
      # Save pages as images in the pdf
    images[i].save('../' + directory + '.page' + str(i) +'.png', 'PNG')


for i in range(len(images)):

        # Return the obtained json data
    jsonData = decode_divoc_covid19_qr('../' + directory + '.page' + str(i) + '.png') 
    load = json.dumps(jsonData)
    print(json.loads(load))
