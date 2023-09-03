# JWTセキュリティ入門
## ラボ環境の概要
### [Trial0](./trial0)
Trial1~3におけるベース環境。JWTを用いた認可機能を持つAPIが提供される。

[APIのソースコード](./trial0/index.js)

### [Trial1](./trial1)
アルゴリズムをnoneに変更する攻撃を検証するための環境。

[APIのソースコード](./trial1/index.js)

[解説](./trial1/README.md)

### [Trial2](./trial2)
アルゴリズムをRS256からHS256に変更する攻撃を検証するための環境。

[APIのソースコード](./trial2/index.js)

[解説](./trial2/README.md)

### [Trial3](./trial3)
チャレンジ問題。以下のURLから問題サーバにアクセス可能。

https://2023-beginnerslive-jwt-chall.vercel.app

[APIのソースコード](./trial3/index.js)

## ラボ環境の起動

```
$ cd yuasa
$ docker compose up --build -d
```

## ラボ環境の停止・削除

```
$ docker compose down
```