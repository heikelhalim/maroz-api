const express = require("express");
var router = express.Router();


const Common = require("../controller/Common");

router.get('/common/list/:id',  Common.getDropDown);



 module.exports = router;