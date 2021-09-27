const express = require("express");
var router = express.Router();


const Kontrak = require("../../controller/tempahan/Kontrak");

router.post('/kontrak/create',  Kontrak.create);
router.post('/kontrak/list',  Kontrak.getList);
router.get('/kontrak/view/:id',  Kontrak.getDetails);
router.delete('/kontrak/deletekontrak/:id',  Kontrak.deleteKontrak);


router.post('/kontrak/assignpemakai/',  Kontrak.assignPemakaiKontrak);
router.delete('/kontrak/deletepemakai/',  Kontrak.deletePemakaiKontrak);


 module.exports = router;