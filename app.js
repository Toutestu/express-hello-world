// モジュールのインポート
const https = require("https");
const express = require("express");

// 環境変数の取得
const PORT = process.env.PORT || 10000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;

// Expressアプリケーションオブジェクトの生成
const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ドメインのルートエンドポイント
app.get("/", (_, res) => {
  res.sendStatus(200);
});

// Messaging APIのWebhookエンドポイント
app.post("/webhook", (req, res, next) => {
  try {
    console.log("Received request body:", req.body); // 追加: リクエストボディのログ

    if (req.body.events && req.body.events.length > 0 && req.body.events[0].type === "message") {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      };

      const data = {
        replyToken: req.body.events[0].replyToken,
        messages: [
          { type: "text", text: "Hello, user" },
          { type: "text", text: "May I help you?" },
        ],
      };

      const options = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
      };

      const request = https.request(options, (apiRes) => {
        let responseData = "";
        apiRes.on("data", (chunk) => {
          responseData += chunk;
        });
        apiRes.on("end", () => {
          console.log("Response from LINE API:", responseData);
          res.status(200).send("Message sent");
        });
      });

      request.on("error", (err) => {
        console.error("Error sending message:", err);
        next(err);
      });

      request.write(JSON.stringify(data));
      request.end();
    } else {
      res.status(400).send("Invalid event data");
    }
  } catch (err) {
    next(err);
  }
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).send("Server Error");
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
