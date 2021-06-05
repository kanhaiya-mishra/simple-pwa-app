const express = require('express');
const mongoose = require('mongoose');
const app = express();
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log("Connected to Mongo");
});

mongoose.connection.on('error', () => {
    console.log("Error in connecting to Mongo DB");
});

require('./server/pwaPosts');
require('./server/subscriptions');

app.use(express.json());
app.use(require('./server/route'));

//setting middleware
app.use(express.static(__dirname + '/public')); //Serves resources from public folder

app.get('*', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/public' });
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Started on some port, maybe 8080");
});