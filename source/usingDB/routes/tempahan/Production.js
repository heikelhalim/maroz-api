const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Production = require("../../controller/tempahan/Production");

router.post('/production/list',Auth.verifyToken,  Production.senaraiProduction);

router.get('/production/statusCount/:status',Auth.verifyToken,  Production.getStatusCountProduction);

router.get('/production/listTukangAssign/:flow',Auth.verifyToken,  Production.getListTukangAssign);

router.post('/production/detailTempahanPemakai/:id',Auth.verifyToken,  Production.getDetailTempahanPemakai);
router.post('/production/assignTukang',Auth.verifyToken,  Production.assignTukang);
router.post('/production/revertToBelumAgih',Auth.verifyToken,  Production.revertPendingToBelumAgih);
router.post('/production/assignPendingToProses',Auth.verifyToken,  Production.assignPendingToProses);
router.post('/production/assignProsesToSelesai',Auth.verifyToken,  Production.barcodeScanSelesaiProses);
router.post('/production/printBarcode',Auth.verifyToken,  Production.cetakBarcode);


router.post('/production/printUkuran',Auth.verifyToken,  Production.cetakSenaraiUkuranMengikutTukang);
router.post('/production/senaraiPackaging',Auth.verifyToken,  Production.getListTempahanPackaging);


router.post('/production/assignToPackaging',Auth.verifyToken,  Production.assignToPackaging);
router.get('/production/statusCountPacking',Auth.verifyToken,  Production.getStatusCountPackaging);
router.post('/production/printPackaging',Auth.verifyToken,  Production.cetakSenaraiUkuranPacking);


module.exports = router;