var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({extended:true});

app.post('/', (req,res)=>{
    console.log(res.name);
})

app.listen(3000, (err,res)=>{
    console.log("Server Running AddBatsman");
})