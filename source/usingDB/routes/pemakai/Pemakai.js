
const express = require("express");
var router = express.Router();


const Pemakai = require("../../controller/pemakai/Pemakai");

router.post('/pemakai/create',  Pemakai.create);
router.post('/pemakai/list',  Pemakai.getList);
router.get('/pemakai/view/:id',  Pemakai.getDetails);
 
 module.exports = router;