import express from "express";
const app = express();
let counter = 0;
app.get("/", (req, res) => res.json({ counter }));
app.get("/increment", (req, res) => res.json({ counter: ++counter }));
app.get("/decrement", (req, res) => res.json({ counter: --counter }));
app.get("/reset", (req, res) => res.json({ counter: counter = 0 }));
app.listen(8080);
