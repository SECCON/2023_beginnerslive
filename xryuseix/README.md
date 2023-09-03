# WebアプリケーションのZodを用いたユーザ入力検証

[ここにスライドのURL](ここにスライドのURL)

## 問題への挑戦方法

サーバを二つ用意しています(corCTF-2021 web/buymeより一部改変)。

* 問題サーバ: [`https://x-beginnerslive2023.deno.dev`](https://x-beginnerslive2023.deno.dev)
* 問題サーバ(紹介する脆弱性を修正したもの): [`https://x-beginnerslive2023-fixed.deno.dev`](https://x-beginnerslive2023-fixed.deno.dev)

以下のようにアクセスできます。

```py
import requests

url = "https://x-beginnerslive2023.deno.dev"
r = requests.get(url, params={"q": '{ "role": "user" }'})
print(r.text)
```

```sh
curl 'https://x-beginnerslive2023.deno.dev/?q=%7b%22role%22:%22admin%22%7d'
```

### スライドに出てくるサンプル問題

[chall.js](./chall.js)

`deno run -A chall.js`などで実行できます。

### スライドに出てくるサンプル問題 (TypeScriptバージョン)

[chall.ts](./chall.ts)

`deno run -A chall.ts`などで実行できます。

## サンプル問題を修正したコード

[fixed.ts](./fixed.ts)

`deno run -A fixed.ts`などで実行できます。
