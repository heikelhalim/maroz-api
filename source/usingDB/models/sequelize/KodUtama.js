
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const KodUtamaModel = require('../../models/define/KodUtama');
const KodUtama = KodUtamaModel(sequelize.sequelizeConn, seqlib);

 
module.exports = KodUtama;