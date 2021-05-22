var express = require('express');
var app = express();

//setting middleware
app.use(express.static(__dirname + '/public')); //Serves resources from public folder

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/public' });
});

var server = app.listen(8080, () => {
    console.log("Started on http://localhost:8080");
});