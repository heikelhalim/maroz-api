
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const TempahanPemakaiModel = require('../../models/define/TempahanPemakai');
const TempahanPemakai = TempahanPemakaiModel(sequelize.sequelizeConn, seqlib);

const KontrakModel = require('../../models/define/Kontrak');
const Kontrak = KontrakModel(sequelize.sequelizeConn, seqlib);


const PemakaiModel = require('../../models/define/Pemakai');
const Pemakai = PemakaiModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);


 
TempahanPemakai.belongsTo(Kontrak, {foreignKey: 'id_kontrak', targetKey: 'id_kontrak', as: 'Kontrak'});
TempahanPemakai.belongsTo(Pemakai, {foreignKey: 'id_pemakai', targetKey: 'id_pemakai', as: 'Pemakai'});
TempahanPemakai.belongsTo(KodKedua, {foreignKey: 'id_status', targetKey: 'id_kod_kedua', as: 'Status'});



module.exports = TempahanPemakai;