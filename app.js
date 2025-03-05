app.post("/webhook", (req, res) => {
  if (req.body.events && req.body.events[0].type === "message") {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    };
    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        { type: "text", text: "Hello, user" },
        { type: "text", text: "May I help you?" },
      ],
    });
    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
    };
    const request = https.request(webhookOptions, (apiRes) => {
      apiRes.on("data", (d) => {
        process.stdout.write(d);
      });
      apiRes.on("end", () => {
        res.send("Message sent");
      });
    });
    request.on("error", (err) => {
      console.error(err);
      res.status(500).send("Server Error");
    });
    request.write(dataString);
    request.end();
  } else {
    res.status(400).send("Invalid request");
  }
});
