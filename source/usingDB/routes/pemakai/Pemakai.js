
const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Pemakai = require("../../controller/pemakai/Pemakai");

router.post('/pemakai/create',Auth.verifyToken,  Pemakai.create);
router.post('/pemakai/list', Auth.verifyToken, Pemakai.getList);
router.get('/pemakai/view/:id', Auth.verifyToken,  Pemakai.getDetails);
 
 module.exports = router;