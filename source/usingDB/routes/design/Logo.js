const express = require("express");
var router = express.Router();


const Logo = require("../../controller/design/Logo");

router.post('/design/logo/create',  Logo.create);
router.post('/design/logo/list',  Logo.getList);
router.get('/design/logo/details/:id',  Logo.getDetails);


module.exports = router;