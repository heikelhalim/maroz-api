
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const DeliveryOrderModel = require('../../models/define/DeliveryOrder');
const DeliveryOrder = DeliveryOrderModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);

const KontrakModel = require('../../models/define/Kontrak');
const Kontrak = KontrakModel(sequelize.sequelizeConn, seqlib);



DeliveryOrder.belongsTo(KodKedua, {foreignKey: 'status', targetKey: 'id_kod_kedua', as: 'Status'});
DeliveryOrder.belongsTo(Kontrak, {foreignKey: 'id_kontrak', targetKey: 'id_kontrak', as: 'Kontrak'});
 

module.exports = DeliveryOrder;