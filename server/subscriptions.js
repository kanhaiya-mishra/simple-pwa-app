const mongoose = require('mongoose');

const subscription = new mongoose.Schema({
    endpoint: {
        type: String,
        default: ""
    },
    expirationTime: {
        type: String,
        default: ""
    },
    keys: {
        type: Object,
        default: {}
    }
})

mongoose.model("Subscription", subscription);