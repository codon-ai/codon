import express from "express";
import crypto from "node:crypto";

const app = express();
const MAX_SIZE = 2 * 1024 * 1024;

app.post("/upload", (req, res) => {
  const chunks = [];
  let totalBytes = 0;
  let tooLarge = false;

  req.on("data", (chunk) => {
    if (tooLarge) return;
    totalBytes += chunk.length;
    if (totalBytes > MAX_SIZE) {
      tooLarge = true;
      res.status(413).json({
        error: "Payload too large: exceeds 2MB limit",
      });
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on("end", () => {
    if (tooLarge) return;
    const buffer = Buffer.concat(chunks);
    const sha1 = crypto.createHash("sha1").update(buffer).digest("hex");
    res.status(201).json({
      success: true,
      size: buffer.length,
      sha1,
    });
  });
});

app.listen(8082);
