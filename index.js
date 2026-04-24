"use strict";

const mongoose = require("mongoose");
const app = require("./app");
const { url, port } = require("./config");

mongoose
    .connect(url + "/pokemon_app")
.then(() => {
    console.log("Connected!");
})
.catch((err) => {
    console.log('Pas connecté : ',err);
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})
