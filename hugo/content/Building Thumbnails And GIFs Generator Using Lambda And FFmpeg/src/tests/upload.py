import os
import requests
import sys
import hashlib
from requests_toolbelt.multipart.encoder import MultipartEncoder

url = sys.argv[1]

os.system('curl -v -F "file=@small.mp4;type=video/mp4" "' + url + '"')

hexdigest = hashlib.md5(open("small.mp4", "rb").read()).hexdigest()

print(f"md5(small.mp4)={hexdigest}")