// モジュールのインポート
const https = require("https");
const express = require("express");

// 環境変数の取得
// ポート番号
const PORT = process.env.PORT || 3000;
// Messaging APIを呼び出すためのトークン
const TOKEN = process.env.LINE_ACCESS_TOKEN;

// Expressアプリケーションオブジェクトの生成
const app = express();

// ミドルウェアの設定
app.use(express.json()); // JSON形式のリクエストボディをパースするミドルウェア
app.use(express.urlencoded({ extended: true })); // URLエンコードされたデータをパースするミドルウェア

// ルーティングの設定-ドメインのルート
app.get("/", (_, res) => {
  res.sendStatus(200); // ステータスコード200を返す
});

// ルーティングの設定-Messaging API
app.post("/webhook", (req, res) => {
  console.log("Received request body:", req.body); // 追加: リクエストボディのログ

  if (req.body.events && req.body.events.length > 0) {
    if (req.body.events[0].type === "message") {
      res.send("HTTP POST request sent to the webhook URL!");
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      };
      const dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            type: "text",
            text: "Hello, user",
          },
          {
            type: "text",
            text: "May I help you?",
          },
        ],
      });
      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
      };
      const request = https.request(webhookOptions, (apiRes) => {
        let responseData = "";
        apiRes.on("data", (chunk) => {
          responseData += chunk;
        });
        apiRes.on("end", () => {
          console.log("Response from LINE API:", responseData);
          if (apiRes.statusCode !== 200) {
            console.error("Error response from LINE API:", responseData);
            res.status(apiRes.statusCode).send("Error from LINE API");
          } else {
            res.status(200).send("Message sent");
          }
        });
      });

      request.on("error", (err) => {
        console.error("Error sending message:", err);
      });

      request.write(dataString);
      request.end();
    } else {
      res.status(400).send("Invalid event type");
    }
  } else {
    res.status(200).send("No events to process"); // 変更: イベントがない場合でも200を返す
  }
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).send("Server Error");
});

// リスナーの設定
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
