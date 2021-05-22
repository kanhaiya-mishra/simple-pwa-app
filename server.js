var express = require('express');
var app = express();

//setting middleware
app.use(express.static(__dirname + '/public')); //Serves resources from public folder

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/public' });
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Started on some port, maybe 8080");
});