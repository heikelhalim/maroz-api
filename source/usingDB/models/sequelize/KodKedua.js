
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);

const KodUtamaModel = require('../../models/define/KodUtama');
const KodUtama = KodUtamaModel(sequelize.sequelizeConn, seqlib);
 
KodKedua.belongsTo(KodUtama, {foreignKey: 'id_kod_utama', targetKey: 'id_kod_utama', as: 'KodUtama'});

module.exports = KodKedua;