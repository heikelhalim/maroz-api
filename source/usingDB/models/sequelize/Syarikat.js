
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const SyarikatModel = require('../../models/define/Syarikat');
const Syarikat = SyarikatModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);


 
// Pengguna Relationship
Syarikat.belongsTo(KodKedua, {foreignKey: 'id_negeri', targetKey: 'id_kod_kedua', as: 'Negeri'});
Syarikat.belongsTo(KodKedua, {foreignKey: 'id_jenis_perniagaan', targetKey: 'id_kod_kedua', as: 'JenisPerniagaan'});


module.exports = Syarikat;