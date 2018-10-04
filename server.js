const express = require("express");
const http =require("https");
var app = express();
var port = 3000;

var httpServer =http.createServer(app);
httpServer.listen(port, function(){
  console.log("server running at http:localhost:3000");
});


app.get('/', function(req, res){
  res.send("index.html");
})
