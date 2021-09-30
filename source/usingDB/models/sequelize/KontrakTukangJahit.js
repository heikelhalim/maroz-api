
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const KontrakTukangJahitModel = require('../../models/define/KontrakTukangJahit');
const KontrakTukangJahit = KontrakTukangJahitModel(sequelize.sequelizeConn, seqlib);

const PenggunaModel = require('../../models/define/User');
const Pengguna = PenggunaModel(sequelize.sequelizeConn, seqlib);


 
KontrakTukangJahit.belongsTo(Pengguna, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'TukangJahit'});


module.exports = KontrakTukangJahit;