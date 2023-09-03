const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const PORT = 5502;
const FLAG = "flag{this_is_trial1_flag}";

const app = express();
app.use(express.json());

const secret = crypto.randomBytes(16).toString("hex");

const users = [
  {
      username: "admin",
      password: crypto.randomBytes(16).toString("hex"),
  },
  {
      username: "guest",
      password: "guest"
  }
]

function isUserExist(username, password) {
    for(let user of users) {
        if(user.username === username && user.password === password) {
            return true;
        }
    }
    return false;
}

// サインインエンドポイント
app.post("/signin", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Please send username and password" });
    return;
  }

  if (!isUserExist(username, password)) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  let signed;
  try {
    signed = jwt.sign({
        username: username,
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
      "",
      { algorithms: ["none"] }
    );
  } catch (err) {
    res.status(401).json({ error: "Invalid Token" });
    return;
  }

  if (verified.username === "admin") {
    res.send(`Congratulations! Here"s your flag: ${FLAG}`);
    return;
  }

  res.send("No flag for you");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});