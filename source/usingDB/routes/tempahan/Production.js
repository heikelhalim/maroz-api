const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Production = require("../../controller/tempahan/Production");

router.post('/production/list',Auth.verifyToken,  Production.senaraiProduction);
router.post('/production/detailTempahanPemakai/:id',Auth.verifyToken,  Production.getDetailTempahanPemakai);
router.post('/production/assignTukang',Auth.verifyToken,  Production.assignTukang);
router.post('/production/revertToBelumAgih',Auth.verifyToken,  Production.revertPendingToBelumAgih);
router.post('/production/assignPendingToProses',Auth.verifyToken,  Production.assignPendingToProses);
router.post('/production/assignProsesToSelesai',Auth.verifyToken,  Production.barcodeScanSelesaiProses);
router.post('/production/printBarcode',Auth.verifyToken,  Production.cetakBarcode);




module.exports = router;