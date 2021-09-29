
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const RoleModel = require('../../models/define/Role');
const Role = RoleModel(sequelize.sequelizeConn, seqlib);


const RolePermissionModel = require('../../models/define/RolePermission');
const RolePermission = RolePermissionModel(sequelize.sequelizeConn, seqlib);

  
Role.hasMany(RolePermission, {foreignKey: 'id_role', targetKey: 'id_role', as: 'Permission'});

 

module.exports = Role;