import requests
import json
import jwt
#pyjwt==2.7.0

HOST = "http://localhost:5501"

data = {
    "username": "admin",
    "password": "admin"
}

# /signin
signin_response = requests.post(f"{HOST}/signin", json=data)
print("/signin:", signin_response.text)
encoded_jwt = signin_response.headers['Authorization']
print("encoded jwt:", encoded_jwt)
print("jwt payload:", jwt.decode(encoded_jwt, options={"verify_signature": False}))

# /flag
flag_response = requests.get(f"{HOST}/flag", headers={"Authorization": encoded_jwt})
print("/flag", flag_response.text)
