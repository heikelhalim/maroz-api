const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Kontrak = require("../../controller/tempahan/Kontrak");

router.post('/kontrak/create',Auth.verifyToken,  Kontrak.create);
router.post('/kontrak/list',Auth.verifyToken,  Kontrak.getList);
router.get('/kontrak/view/:id', Auth.verifyToken, Kontrak.getDetails);
router.delete('/kontrak/deletekontrak/:id', Auth.verifyToken, Kontrak.deleteKontrak);


router.post('/kontrak/assignpemakai/',Auth.verifyToken,  Kontrak.assignPemakaiKontrak);
router.post('/kontrak/tempahan/create',Auth.verifyToken,  Kontrak.createTempahan);


router.delete('/kontrak/deletepemakai/', Auth.verifyToken, Kontrak.deletePemakaiKontrak);


 module.exports = router;