
const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");
const Staff = require("../../controller/staff/Staff");

router.post('/staff/list', Auth.verifyToken, Staff.getListStaff);
router.post('/staff/create', Auth.verifyToken, Staff.creatNonSystemUser);


 module.exports = router;