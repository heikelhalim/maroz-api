
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');


const TempahanProductionModel = require('../../models/define/TempahanProduction');
const TempahanProduction = TempahanProductionModel(sequelize.sequelizeConn, seqlib);

const TempahanUkuranModel = require('../../models/define/TempahanUkuran');
const TempahanUkuran = TempahanUkuranModel(sequelize.sequelizeConn, seqlib);

const PenggunaModel = require('../../models/define/User');
const Pengguna = PenggunaModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);


 
TempahanProduction.belongsTo(KodKedua, {foreignKey: 'status_potong', targetKey: 'id_kod_kedua', as: 'StatusPotong'});
TempahanProduction.belongsTo(KodKedua, {foreignKey: 'status_jahit', targetKey: 'id_kod_kedua', as: 'StatusJahit'});
TempahanProduction.belongsTo(KodKedua, {foreignKey: 'status_butang', targetKey: 'id_kod_kedua', as: 'StatusButang'});
TempahanProduction.belongsTo(KodKedua, {foreignKey: 'status_sulam', targetKey: 'id_kod_kedua', as: 'StatusSulam'});
TempahanProduction.belongsTo(KodKedua, {foreignKey: 'status_qc', targetKey: 'id_kod_kedua', as: 'StatusQC'});
TempahanProduction.belongsTo(KodKedua, {foreignKey: 'status_packaging', targetKey: 'id_kod_kedua', as: 'StatusPackaging'});

TempahanProduction.belongsTo(Pengguna, {foreignKey: 'id_tukang_potong', targetKey: 'id_pengguna', as: 'TukangPotong'});
TempahanProduction.belongsTo(Pengguna, {foreignKey: 'id_tukang_jahit', targetKey: 'id_pengguna', as: 'TukangJahit'});
TempahanProduction.belongsTo(Pengguna, {foreignKey: 'id_tukang_butang', targetKey: 'id_pengguna', as: 'TukangButang'});
TempahanProduction.belongsTo(Pengguna, {foreignKey: 'id_tukang_sulam', targetKey: 'id_pengguna', as: 'TukangSulam'});
TempahanProduction.belongsTo(Pengguna, {foreignKey: 'id_tukang_qc', targetKey: 'id_pengguna', as: 'TukangQC'});
TempahanProduction.belongsTo(Pengguna, {foreignKey: 'id_tukang_packaging', targetKey: 'id_pengguna', as: 'TukangPackaging'});


TempahanProduction.belongsTo(TempahanUkuran, {foreignKey: 'id_tempahan_ukuran', targetKey: 'id_tempahan_ukuran', as: 'TempahanUkuran'});




module.exports = TempahanProduction;