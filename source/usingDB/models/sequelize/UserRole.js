
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const UserRoleModel = require('../../models/define/UserRole');
const UserRole = UserRoleModel(sequelize.sequelizeConn, seqlib);

const RoleModel = require('../../models/define/Role');
const Role = RoleModel(sequelize.sequelizeConn, seqlib);

 
 
UserRole.belongsTo(Role, {foreignKey: 'id_role', targetKey: 'id_role', as: 'JenisRole'});



module.exports = UserRole;