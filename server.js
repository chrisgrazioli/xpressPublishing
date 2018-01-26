const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler=require('errorhandler');
const morgan=require('morgan');
const express = require('express');

const app = express();
const apiRouter= require('./api/api');

const PORT= process.env.PORT || 4000;

//app.use(bodyParser.json());
//app.use(errorhandler());
//app.use(cors());
//app.use(morgan('dev'));

//apparently middleware order matters??
// THANK YOU https://youtu.be/msw1D8oSw5M?t=13m50s
app.use(bodyParser.json());
app.use(cors());

app.use('/api', apiRouter);

app.use(errorhandler());

app.listen(PORT, ()=>{
  console.log(`Server listening on port ${PORT}`);
});

module.exports=app;
