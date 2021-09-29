
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const RolePermissionModel = require('../../models/define/RolePermission');
const RolePermission = RolePermissionModel(sequelize.sequelizeConn, seqlib);

const PageModel = require('../../models/define/Page');
const Page = PageModel(sequelize.sequelizeConn, seqlib);

 
RolePermission.belongsTo(Page, {foreignKey: 'id_page', targetKey: 'id_page', as: 'Page'});



module.exports = RolePermission;