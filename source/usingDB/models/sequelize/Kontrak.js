
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const KontrakModel = require('../../models/define/Kontrak');
const Kontrak = KontrakModel(sequelize.sequelizeConn, seqlib);

const KontrakTukangJahitModel = require('../../models/define/KontrakTukangJahit');
const KontrakTukangJahit = KontrakTukangJahitModel(sequelize.sequelizeConn, seqlib);

const SyarikatModel = require('../../models/define/Syarikat');
const Syarikat = SyarikatModel(sequelize.sequelizeConn, seqlib);

const DesignPakaianModel = require('../../models/define/DesignPakaian');
const DesignPakaian = DesignPakaianModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);


 
Kontrak.belongsTo(Syarikat, {foreignKey: 'id_syarikat', targetKey: 'id_syarikat', as: 'Syarikat'});
Kontrak.belongsTo(KodKedua, {foreignKey: 'id_jenis_kontrak', targetKey: 'id_kod_kedua', as: 'JenisKontrak'});
Kontrak.belongsTo(KodKedua, {foreignKey: 'id_jenis_kerja', targetKey: 'id_kod_kedua', as: 'JenisKerja'});
Kontrak.belongsTo(DesignPakaian, {foreignKey: 'id_dsgn_pakaian', targetKey: 'id_dsgn_pakaian', as: 'RujDsgnPakaian'});
Kontrak.belongsTo(KodKedua, {foreignKey: 'id_status_proses_kontrak', targetKey: 'id_kod_kedua', as: 'StatusProsesKontrak'});
Kontrak.hasMany(KontrakTukangJahit, {foreignKey: 'id_kontrak', targetKey: 'id_kontrak', as: 'ListTukangJahit'});



module.exports = Kontrak;