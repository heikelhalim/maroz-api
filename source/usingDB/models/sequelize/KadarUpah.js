
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const KadarUpahModel = require('../../models/define/KadarUpah');
const KadarUpah = KadarUpahModel(sequelize.sequelizeConn, seqlib);

 
module.exports = KadarUpah;