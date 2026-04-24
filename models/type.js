const mongoose = require('mongoose');

const Type = mongoose.model('Type', {
    name: String
});

module.exports = Type;