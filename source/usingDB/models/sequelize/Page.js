
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const PageModel = require('../../models/define/Page');
const Page = PageModel(sequelize.sequelizeConn, seqlib);

 

module.exports = Page;