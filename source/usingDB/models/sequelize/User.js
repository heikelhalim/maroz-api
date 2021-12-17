
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const PenggunaModel = require('../../models/define/User');
const Pengguna = PenggunaModel(sequelize.sequelizeConn, seqlib);

const UserRoleModel = require('../../models/define/UserRole');
const UserRole = UserRoleModel(sequelize.sequelizeConn, seqlib);
 
const UserJobModel = require('../../models/define/UserJob');
const UserJob = UserJobModel(sequelize.sequelizeConn, seqlib);

const TempahanProductionModel = require('../../models/define/TempahanProduction');
const TempahanProduction = TempahanProductionModel(sequelize.sequelizeConn, seqlib);

// Pengguna Relationship
// Pengguna.belongsTo(KodStandardKedua, {foreignKey: 'id_negeri', targetKey: 'id_standard_kedua', as: 'Negeri'});
Pengguna.hasOne(UserRole, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'Role'});
Pengguna.hasMany(UserJob, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'Job'});
Pengguna.hasMany(TempahanProduction, {foreignKey: 'id_tukang_potong', targetKey: 'id_pengguna', as: 'SenaraiPotong'});
Pengguna.hasMany(TempahanProduction, {foreignKey: 'id_tukang_jahit', targetKey: 'id_pengguna', as: 'SenaraiJahit'});
Pengguna.hasMany(TempahanProduction, {foreignKey: 'id_pengid_tukang_butangguna', targetKey: 'id_pengguna', as: 'SenaraiButang'});
Pengguna.hasMany(TempahanProduction, {foreignKey: 'id_tukang_sulam', targetKey: 'id_pengguna', as: 'SenaraiSulam'});
Pengguna.hasMany(TempahanProduction, {foreignKey: 'id_tukang_qc', targetKey: 'id_pengguna', as: 'SenaraiQC'});
Pengguna.hasMany(TempahanProduction, {foreignKey: 'id_tukang_packaging', targetKey: 'id_pengguna', as: 'SenaraiPackaging'});


module.exports = Pengguna;