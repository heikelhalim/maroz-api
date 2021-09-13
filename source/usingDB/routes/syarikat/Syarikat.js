const express = require("express");
var router = express.Router();


const Syarikat = require("../../controller/syarikat/Syarikat");

router.post('/syarikat/create',  Syarikat.create);
router.post('/syarikat/list',  Syarikat.getList);
router.get('/syarikat/view/:id',  Syarikat.getDetails);
 
 module.exports = router;