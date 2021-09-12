
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const PenggunaModel = require('../../models/define/User');
const Pengguna = PenggunaModel(sequelize.sequelizeConn, seqlib);

 
// Pengguna Relationship
// Pengguna.belongsTo(KodStandardKedua, {foreignKey: 'id_negeri', targetKey: 'id_standard_kedua', as: 'Negeri'});
// Pengguna.belongsTo(KodStandardKedua, {foreignKey: 'id_jenis_pelanggan', targetKey: 'id_standard_kedua', as: 'JenisPelanggan'});
// Pengguna.belongsTo(KodStandardKedua, {foreignKey: 'id_bangsa', targetKey: 'id_standard_kedua', as: 'Bangsa'});
// Pengguna.belongsTo(KodStandardKedua, {foreignKey: 'id_warganegara', targetKey: 'id_standard_kedua', as: 'Warganegara'});
// Pengguna.belongsTo(KodStandardKedua, {foreignKey: 'id_bank', targetKey: 'id_standard_kedua', as: 'Bank'});
// Pengguna.belongsTo(Entiti, {foreignKey: 'id_organisasi', targetKey: 'id_entiti', as: 'Organisasi'});
// Pengguna.hasOne(Staf, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'Staf'});
// Pengguna.hasOne(PenggunaSyarikat, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'PenggunaSyarikat'});
// Pengguna.hasMany(PersatuanKayu, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'PersatuanKayu'});
// Pengguna.hasMany(MohonAktiviti, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'MohonAktiviti'});
// Pengguna.hasOne(MohonAktiviti, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'Aktiviti'});
// Pengguna.belongsTo(KodStandardKedua, {foreignKey: 'id_jenis_pengenalan', targetKey: 'id_standard_kedua', as: 'JenisPengenalan'});
// Pengguna.belongsTo(KodStandardKedua, {foreignKey: 'id_jawatan', targetKey: 'id_standard_kedua', as: 'Jawatan'});
// Pengguna.hasMany(KursusDaftar, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'KursusDaftar'});
// Pengguna.hasOne(KursusHadir, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'KursusHadir'});
// Pengguna.belongsTo(Ewallet, {foreignKey: 'id_ewallet', targetKey: 'id_ewallet', as: 'Ewallet'});
// Pengguna.hasMany(Peranti, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'Peranti'});
// Pengguna.hasMany(Persatuan, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'Persatuan'});
// Pengguna.hasMany(PerananPengguna, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'PerananPengguna'});
// Pengguna.hasOne(PerananPengguna, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'PerananPenggunaOne'});
// Pengguna.hasMany(PemeriksaanFizikalPegawai, {foreignKey: 'id_pegawai', targetKey: 'id_pengguna', as: 'PemeriksaanFizikalPegawai'});
// // Pengguna.belongs(PemeriksaanFizikalPegawai, {foreignKey: 'id_pengguna', targetKey: 'id_pegawai', as: 'PemeriksaanFizikalPegawai'});
// Pengguna.belongsTo(ImpPemeriksaanFizikalPegawai, {foreignKey: 'id_pengguna', targetKey: 'id_pegawai', as: 'ImpPemeriksaanFizikalPegawai'});
// Pengguna.hasOne(PemeringkatanKursusHadir, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'Kehadiran'});
// Pengguna.belongsTo(PoskodBandar, {foreignKey: 'id_poskod_bandar', targetKey: 'id_poskod_bandar', as: 'PoskodBandar'});
// Pengguna.hasMany(PenggunaLokasi, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'PenggunaLokasi'});
// Pengguna.hasMany(PemeringkatanKursusMohon, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'PemeringkatKursusMohon'});
// Pengguna.hasOne(PemeringkatanKursusMohon, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'PemeringkatKursusMohonOne'});

module.exports = Pengguna;