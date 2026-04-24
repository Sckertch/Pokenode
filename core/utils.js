const Pokemon = require("../models/pokemon");
const {now} = require("mongoose");

function BuildMongo(reqBody, allowedFields) {
    const post = {};
    //console.log(now())

    for (const key of allowedFields) {
        const value = reqBody[key];

        if (value !== undefined && value !== null && value !== "") {
            post[key] = reqBody[key];
        }
    }
    //console.log('builmongo:', post);

    return post;
}

module.exports = BuildMongo;