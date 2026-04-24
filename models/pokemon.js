const mongoose = require('mongoose');

const Pokemon = mongoose.model('Pokemon', {
    name: String,
    description: String,
    types: [{type: mongoose.Schema.Types.ObjectId, ref: "Type"}],
    image: String,
});

module.exports = Pokemon;