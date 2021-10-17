
const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Pemakai = require("../../controller/pemakai/Pemakai");

router.post('/pemakai/create',Auth.verifyToken,  Pemakai.create);
router.post('/pemakai/list', Auth.verifyToken, Pemakai.getList);
router.get('/pemakai/view/:id', Auth.verifyToken,  Pemakai.getDetails);

router.post('/staff/list', Auth.verifyToken, Pemakai.getListStaff);
router.post('/staff/create', Auth.verifyToken, Pemakai.creatNonSystemUser);
 
 module.exports = router;