const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const Syarikat = require("../../controller/syarikat/Syarikat");

router.post('/syarikat/create', Auth.verifyToken,  Syarikat.create);
router.post('/syarikat/list', Auth.verifyToken,  Syarikat.getList);
router.get('/syarikat/view/:id', Auth.verifyToken,  Syarikat.getDetails);
 
router.delete('/syarikat/delete/:id', Auth.verifyToken, Syarikat.delete);


 module.exports = router;