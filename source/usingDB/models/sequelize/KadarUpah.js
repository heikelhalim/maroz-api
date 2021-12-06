const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const KadarUpahModel = require('../../models/define/KadarUpah');
const KadarUpah = KadarUpahModel(sequelize.sequelizeConn, seqlib);

const KontrakModel = require('../../models/define/Kontrak');
const Kontrak = KontrakModel(sequelize.sequelizeConn, seqlib);

const PenggunaModel = require('../../models/define/User');
const Pengguna = PenggunaModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);


KadarUpah.belongsTo(Kontrak, {foreignKey: 'id_kontrak', targetKey: 'id_kontrak', as: 'Kontrak'});
KadarUpah.belongsTo(Pengguna, {foreignKey: 'id_tukang', targetKey: 'id_pengguna', as: 'Tukang'});
KadarUpah.belongsTo(KodKedua, {foreignKey: 'id_jenis_kerja', targetKey: 'id_kod_kedua', as: 'JenisKerja'});
KadarUpah.belongsTo(KodKedua, {foreignKey: 'id_status', targetKey: 'id_kod_kedua', as: 'Status'});


module.exports = KadarUpah;