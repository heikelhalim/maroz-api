
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const PemakaiModel = require('../../models/define/Pemakai');
const Pemakai = PemakaiModel(sequelize.sequelizeConn, seqlib);

const SyarikatModel = require('../../models/define/Syarikat');
const Syarikat = SyarikatModel(sequelize.sequelizeConn, seqlib);

const TempahanPemakaiModel = require('../../models/define/TempahanPemakai');
const TempahanPemakai = TempahanPemakaiModel(sequelize.sequelizeConn, seqlib);
 
Pemakai.belongsTo(Syarikat, {foreignKey: 'id_syarikat', targetKey: 'id_syarikat', as: 'Syarikat'});
Pemakai.hasMany(TempahanPemakai, {foreignKey: 'id_pemakai', targetKey: 'id_pemakai', as: 'TempahanPemakai'});


module.exports = Pemakai;