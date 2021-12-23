
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const TempahanPemakaiModel = require('../../models/define/TempahanPemakai');
const TempahanPemakai = TempahanPemakaiModel(sequelize.sequelizeConn, seqlib);

const KontrakModel = require('../../models/define/Kontrak');
const Kontrak = KontrakModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);

const PenggunaModel = require('../../models/define/User');
const Pengguna = PenggunaModel(sequelize.sequelizeConn, seqlib);

const TempahanUkuranModel = require('../../models/define/TempahanUkuran');
const TempahanUkuran = TempahanUkuranModel(sequelize.sequelizeConn, seqlib);

 
TempahanPemakai.belongsTo(Kontrak, {foreignKey: 'id_kontrak', targetKey: 'id_kontrak', as: 'Kontrak'});
TempahanPemakai.belongsTo(KodKedua, {foreignKey: 'id_status', targetKey: 'id_kod_kedua', as: 'StatusPemakai'});
TempahanPemakai.belongsTo(Pengguna, {foreignKey: 'id_tukang_ukur', targetKey: 'id_pengguna', as: 'TukangUkur'});
TempahanPemakai.hasMany(TempahanUkuran, {foreignKey: 'id_pemakai_tempahan', targetKey: 'id_pemakai_tempahan', as: 'SenaraiTempahan'});



module.exports = TempahanPemakai;