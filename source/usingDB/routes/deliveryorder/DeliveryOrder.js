const express = require("express");
var router = express.Router();
const Auth = require("../../middleware/Auth");

const DeliveryOrder = require("../../controller/deliveryorder/DeliveryOrder");

router.post('/deliveryorder/listTempahanProdSelesai', Auth.verifyToken,  DeliveryOrder.listTempahanSelesaiProd);
router.post('/deliveryorder/listDO', Auth.verifyToken,  DeliveryOrder.listDO);
router.post('/deliveryorder/create', Auth.verifyToken,  DeliveryOrder.createDO);
router.delete('/deliveryorder/delete/:id', Auth.verifyToken,  DeliveryOrder.deleteDO);


 module.exports = router;