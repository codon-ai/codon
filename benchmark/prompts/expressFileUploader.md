# Express Raw Body Upload Endpoint
Create an Express server endpoint handling raw binary file uploads with size limits in a single file.

Requirements:
- Import `express` from `"express"`.
- Create Express app with route `POST /upload`.
- Buffer incoming chunks from `req` stream up to max size of 2MB (2 * 1024 * 1024 bytes).
- If total bytes exceed 2MB, respond with `res.status(413).json({ error: "Payload too large: exceeds 2MB limit" })` and stop buffering.
- On stream `"end"`, concat chunks into a single `Buffer`.
- Respond with `res.status(201).json({ success: true, size: buffer.length, sha1: crypto.createHash("sha1").update(buffer).digest("hex") })`.
- Listen on port 8082.
