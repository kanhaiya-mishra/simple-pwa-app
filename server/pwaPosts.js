const mongoose = require('mongoose');

const pwaPosts = new mongoose.Schema({
    image: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    createdOn: {
        type: Date,
        default: new Date()
    },
})

mongoose.model("PWAPosts", pwaPosts);