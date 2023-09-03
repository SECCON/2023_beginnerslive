const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const PORT = 5504;
const FLAG = "flag{this_is_trial3_flag}";

const app = express();
app.use(express.json());

// シークレットキーを生成
const secret = crypto.randomBytes(16).toString("hex");

// 初期ユーザーを設定
const users = [
  {
    id: "admin",
    username: "admin",
    password: crypto.randomBytes(16).toString("hex"),
  },
  {
    id: "guest",
    username: "guest",
    password: "guest"
  }
]

// ユーザーのプロパティが存在するか確認する関数
function isUserPropertyExist(key, value) {
    return users.some(user => user[key] === value);
}

app.get("/", (req, res) => {
    res.send("Welcome to SECCON Beginners Live 2023 JWT Challenge!");
});

// ユーザー登録エンドポイント
app.post("/signup", (req, res) => {
    const { id, username, password } = req.body;
    if (!id || !username || !password) {
        res.status(400).json({ error: "Please send id, username and password" });
        return;
    }

    if (isUserPropertyExist('username', username)) {
        res.status(400).json({ error: "Username already exists" });
        return;
    }

    if (isUserPropertyExist('id', id)) {
        res.status(400).json({ error: "ID already exists" });
        return;
    }

    users.push({
        id,
        username,
        password
    });
    
    res.json({ message: "User registered successfully" });
});

// サインインエンドポイント
app.post("/signin", (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    res.status(400).json({ error: "Please send username and password" });
    return;
  }

  let user = users.find(u => u.id === id && u.password === password);
  if (!user) {
    res.status(401).json({ error: "Invalid id or password" });
    return;
  }

  let signed;
  try {
    signed = jwt.sign({
        id: user.id,
        username: user.username,
        solved: false
    },
      secret, 
      { algorithm: "HS256", expiresIn: "1h" } 
    );
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }
  res.header("Authorization", signed);

  res.json({ message: "ok" });
});

// ユーザー名更新エンドポイント
app.post("/username/update", (req, res) => {
    const { newUsername } = req.body;
    const token = req.header("Authorization");
    
    if (!newUsername || !token) {
        res.status(400).json({ error: "Please send newUsername and provide JWT token" });
        return;
    }

    let verified;
    try {
        verified = jwt.verify(token, secret, { algorithms: ["HS256"] });
    } catch (err) {
        res.status(401).json({ error: "Invalid Token" });
        return;
    }

    const currentId = verified.id;
    let user = users.find(u => u.id === currentId);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    if (user.username === "admin") {
        res.status(403).json({ error: "Admin user cannot change its username" });
        return;
    }

    user.username = newUsername;
    res.json({ message: "Username updated successfully" });
});

// flag取得エンドポイント
app.get("/flag", (req, res) => {
  if (!req.header("Authorization")) {
    res.status(400).json({ error: "No JWT Token" });
    return;
  }

  let verified;
  try {
    verified = jwt.verify(
      req.header("Authorization"),
      secret, 
      { algorithms: ["HS256"] }
    );
  } catch (err) {
    res.status(401).json({ error: "Invalid Token" });
    return;
  }

  if (verified.username === "admin") {
    let newToken;
    try {
        newToken = jwt.sign({
            id: verified.id,
            username: verified.username,
            solved: true
        },
            secret,
            { algorithm: "HS256", expiresIn: "1h" }
        );
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
        return;
    }

    res.header("Authorization", newToken);
    res.send(`Congratulations! Here's your flag: ${FLAG}`);
    return;
  }

  res.send("No flag for you");
});

// 問題が解けているかどうかを確認するエンドポイント
app.get("/solved/check", (req, res) => {
    if (!req.header("Authorization")) {
        res.status(400).json({ error: "No JWT Token" });
        return;
    }

    let verified;
    try {
        verified = jwt.verify(
            req.header("Authorization"),
            secret,
            { algorithms: ["HS256"] }
        );
    } catch (err) {
        res.status(401).json({ error: "Invalid Token" });
        return;
    }

    if (verified.solved) {
        res.send(`Congratulations ${verified.id}, \nYou solved SECCON Beginners Live 2023 JWT Challenge!!`);
        return;
    } else {
        res.status(403).json({ error: "Challenge not yet solved!" });
    }
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
