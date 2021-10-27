const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Production = require("../../controller/tempahan/Production");

router.post('/production/list',Auth.verifyToken,  Production.senaraiProduction);



 module.exports = router;