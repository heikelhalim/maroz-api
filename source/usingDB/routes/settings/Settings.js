
const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Settings = require("../../controller/settings/Settings")

router.post('/settings/tukang/create',Auth.verifyToken,  Settings.createTukang);
router.post('/settings/tukang/listtukang', Auth.verifyToken, Settings.getListTukang);
// router.get('/pemakai/view/:id', Auth.verifyToken,  Pemakai.getDetails);

// router.post('/staff/list', Auth.verifyToken, Pemakai.getListStaff);
// router.post('/staff/create', Auth.verifyToken, Pemakai.creatNonSystemUser);
 
 module.exports = router;