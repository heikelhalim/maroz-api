const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const KadarUpah = require("../../controller/kiraanUpah/KiraanUpah");

router.post('/kiraanUpah/getList', Auth.verifyToken,  KadarUpah.getList);
router.post('/kiraanUpah/updateUpah', Auth.verifyToken,  KadarUpah.updateKiraanUpah);
router.post('/kiraanUpah/createInvoice', Auth.verifyToken,  KadarUpah.createInvoice);

router.post('/kiraanUpah/getListInvoice', Auth.verifyToken,  KadarUpah.getListInvoice);
router.get('/kiraanUpah/getDetailInvoice/:id', Auth.verifyToken,  KadarUpah.getDetailInvoice);

module.exports = router;