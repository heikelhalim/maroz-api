
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const PenggunaModel = require('../../models/define/User');
const Pengguna = PenggunaModel(sequelize.sequelizeConn, seqlib);

const UserRoleModel = require('../../models/define/UserRole');
const UserRole = UserRoleModel(sequelize.sequelizeConn, seqlib);
 

// Pengguna Relationship
// Pengguna.belongsTo(KodStandardKedua, {foreignKey: 'id_negeri', targetKey: 'id_standard_kedua', as: 'Negeri'});
Pengguna.hasOne(UserRole, {foreignKey: 'id_pengguna', targetKey: 'id_pengguna', as: 'Role'});

module.exports = Pengguna;