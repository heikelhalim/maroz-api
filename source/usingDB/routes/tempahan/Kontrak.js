const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Kontrak = require("../../controller/tempahan/Kontrak");

router.post('/kontrak/create',Auth.verifyToken,  Kontrak.create);
router.post('/kontrak/list',Auth.verifyToken,  Kontrak.getList);
router.get('/kontrak/view/:id', Auth.verifyToken, Kontrak.getDetails);
router.get('/kontrak/genNoKontrak/:id',Auth.verifyToken,  Kontrak.generateNoKontrak);

router.delete('/kontrak/deletekontrak/:id', Auth.verifyToken, Kontrak.deleteKontrak);


// router.post('/kontrak/assignpemakai/',Auth.verifyToken,  Kontrak.assignPemakaiKontrak);

router.post('/kontrak/tempahan/createpemakai',Auth.verifyToken,  Kontrak.createPemakai);
router.get('/kontrak/tempahan/detailspemakai/:id',Auth.verifyToken,  Kontrak.getDetailsPemakai);
router.post('/kontrak/tempahan/listpemakai',Auth.verifyToken,  Kontrak.getListPemakaiKontrak);

router.post('/kontrak/tempahan/createtempahan',Auth.verifyToken,  Kontrak.createTempahan);
router.post('/kontrak/tempahan/listtempahanpemakai',Auth.verifyToken,  Kontrak.getListTempahanPemakai);

router.post('/kontrak/tempahan/hantar',Auth.verifyToken,  Kontrak.hantarTempahan);
router.post('/kontrak/tempahan/listTempahanAll',Auth.verifyToken,  Kontrak.getListTempahanUkuran);

router.get('/kontrak/tempahan/countConfirmTempahan',Auth.verifyToken,  Kontrak.getStatusCountConfirmTempahan);


router.delete('/kontrak/deletepemakai/', Auth.verifyToken, Kontrak.deletePemakaiKontrak);


 module.exports = router;