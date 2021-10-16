const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Kontrak = require("../../controller/tempahan/Kontrak");

router.post('/kontrak/create',Auth.verifyToken,  Kontrak.create);
router.post('/kontrak/list',Auth.verifyToken,  Kontrak.getList);
router.get('/kontrak/view/:id', Auth.verifyToken, Kontrak.getDetails);
router.delete('/kontrak/deletekontrak/:id', Auth.verifyToken, Kontrak.deleteKontrak);


// router.post('/kontrak/assignpemakai/',Auth.verifyToken,  Kontrak.assignPemakaiKontrak);

router.post('/kontrak/tempahan/createpemakai',Auth.verifyToken,  Kontrak.createPemakai);
router.get('/kontrak/tempahan/detailspemakai/:id',Auth.verifyToken,  Kontrak.getDetailsPemakai);
router.post('/kontrak/tempahan/listpemakai',Auth.verifyToken,  Kontrak.getListPemakaiKontrak);

router.post('/kontrak/tempahan/createtempahan',Auth.verifyToken,  Kontrak.createTempahan);
router.post('/kontrak/tempahan/createtempahan',Auth.verifyToken,  Kontrak.createTempahan);


router.delete('/kontrak/deletepemakai/', Auth.verifyToken, Kontrak.deletePemakaiKontrak);


 module.exports = router;