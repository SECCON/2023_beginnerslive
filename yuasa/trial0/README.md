# Trial0
Trial1~3におけるベース環境。JWTを用いた認可機能を持つAPIが提供される。

[APIのソースコード](./index.js)

以下のエンドポイントが存在。
- サインインエンドポイント（`/signin`）
  - `username`と`password`を受け取り、該当のユーザーが存在するか確認。
  - `username`と`password`が正しければJWTを発行して返送する。
- flag取得エンドポイント（`/flag`）
  - JWTを受け取り、検証する。
  - 検証が成功し、`username`が`admin`の場合flagを返す。