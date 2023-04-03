const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) =>
{
    res.send(`Hello from YelpCamp, served from port ${port}!`)
});

app.listen(port, () =>
{
    console.log(`Serving on port ${port}`)
});