
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const PemakaiModel = require('../../models/define/Pemakai');
const Pemakai = PemakaiModel(sequelize.sequelizeConn, seqlib);

const SyarikatModel = require('../../models/define/Syarikat');
const Syarikat = SyarikatModel(sequelize.sequelizeConn, seqlib);

 
Pemakai.belongsTo(Syarikat, {foreignKey: 'id_syarikat', targetKey: 'id_syarikat', as: 'Syarikat'});

module.exports = Pemakai;