import express from "express";

const app = express();

let counter = 0;

app.get("/", function (_, res) {
    res.json({ counter });
});

app.get("/increment", function (_, res) {
    counter++;
    res.json({ counter });
});

app.get("/decrement", function (_, res) {
    counter--;
    res.json({ counter });
});

app.get("/reset", function (_, res) {
    counter = 0;
    res.json({ counter });
});

app.listen(8080);
