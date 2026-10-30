import express from "express";
import crypto from "node:crypto";
const app = express();
app.post("/upload", (req, res) => {
  const chunks = [];
  let size = 0;
  const maxSize = 2 * 1024 * 1024;
  let tooLarge = false;
  req.on("data", chunk => {
    if (tooLarge) return;
    size += chunk.length;
    if (size > maxSize) {
      tooLarge = true;
      res.status(413).json({ error: "Payload too large: exceeds 2MB limit" });
      req.pause();
      return;
    }
    chunks.push(chunk);
  });
  req.on("end", () => {
    if (tooLarge) return;
    const buffer = Buffer.concat(chunks);
    const sha1 = crypto.createHash("sha1").update(buffer).digest("hex");
    res.status(201).json({ success: true, size: buffer.length, sha1 });
  });
});
app.listen(8082);
