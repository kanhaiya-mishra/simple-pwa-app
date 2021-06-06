const mongoose = require('mongoose');

const pwaPost = new mongoose.Schema({
    id: {
        type: String,
        default: ""
    },
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
    rawLocation: {
        type: Object,
        default: {}
    },
    createdOn: {
        type: Date,
        default: new Date()
    },
})

mongoose.model("PWAPost", pwaPost);