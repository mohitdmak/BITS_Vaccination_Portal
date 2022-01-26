import zipfile
import io
import json

import cv2
import zbar
import numpy as np



def decode_divoc_covid19_qr(image_path: str) -> dict:
    """
    Decode DIVOC Covid19 QR code

    Args:
        image_path: path to the QR code image
    
    Returns:
        dict: Embedded W3C verifiable credential JSON
    """

    # Reading QR code image as 2d array
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # Scanning the QR code image and fetch the embedded data
    scanner = zbar.Scanner()
    results = scanner.scan(np.asarray(img))

    # Embedded binary data
    qr_bytes = results[0].data

    # Create unicode array from the embedded data
    unicode_array = []
    for i in qr_bytes.decode("utf-8"):
        unicode_array.append(ord(i))

    # Create ZipFile instance from the unicode array
    zf = zipfile.ZipFile(io.BytesIO(bytes(unicode_array)), "r")

    return json.loads(zf.read(zf.infolist()[0]).decode("utf-8"))
