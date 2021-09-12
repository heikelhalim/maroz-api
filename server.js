// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");



// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import customValidator from './source/usingDB/middleware/validator/CustomValidator.js';

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
  
dotenv.config(); 
   
const app = express();
// var useragent = require('express-useragent');
// const requestIp = require('request-ip');

// var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));


//
 
app.use(express.json()); 

// app.use(expressValidator({
//   customValidators: customValidator
// }));

// app.use(useragent.express());
// app.use(requestIp.mw());

// This middleware should be added before any routes are defined.
// app.use(airbrakeExpress.makeMiddleware(airbrake));

// Serving static files from "public" folder
app.use(express.static('public'));

// set timeout
app.use(function(req, res, next){
  try {
    res.setTimeout(60000, function(){
      return res.status(408).send({'message': 'Looks like the server is taking to long to respond, please try again in sometime'});
    });
    next();
  } catch(error) {
    return res.status(400).send(error);
  }
});

// cors part start
var whitelist = ['https://dev.itimber.xyz','https://staging.itimber.xyz', 'http://localhost:4000', 'http://localhost:3000', 'http://192.168.56.102','https://apistaging.itimber.xyz', 'https://api.itimber.xyz', 'http://192.168.56.101', 'http://localhost:4001', 'https://staginglp.itimber.xyz', 'https://stagingmdi.itimber.xyz', 'https://devuiux.itimber.xyz', 'https://devenf.itimber.xyz', 'https://devsignet.itimber.xyz', 'https://apidemo.itimber.xyz', 'https://demostag.itimber.xyz', 'https://demoenf.itimber.xyz', 'https://stag.itimber.mtib.gov.my']
var corsOptions = {
  origin: whitelist
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
// cors part end

app.set('trust proxy', true);
var corsOptions = {
  origin: "http://localhost:3000"
};
 
app.use(cors(corsOptions));

 
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

  
// Authentication
// app.use(require('./source/usingDB/routes/authentication/Authentication')); 
 

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});




