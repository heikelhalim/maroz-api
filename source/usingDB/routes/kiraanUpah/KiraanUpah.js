const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const KadarUpah = require("../../controller/kiraanUpah/KiraanUpah");

router.post('/kiraanUpah/getList', Auth.verifyToken,  KadarUpah.getList);
router.post('/kiraanUpah/updateUpah', Auth.verifyToken,  KadarUpah.updateKiraanUpah);


 module.exports = router;