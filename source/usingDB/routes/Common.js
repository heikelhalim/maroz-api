const express = require("express");
var router = express.Router();
const Auth = require("../middleware/Auth");

const Common = require("../controller/Common");

router.get('/common/list/:id', Auth.verifyToken, Common.getDropDown);



 module.exports = router;