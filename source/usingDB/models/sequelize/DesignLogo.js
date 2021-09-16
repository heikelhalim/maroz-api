
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const DesignLogoModel = require('../../models/define/DesignLogo');
const DesignLogo = DesignLogoModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);

const SyarikatModel = require('../../models/define/Syarikat');
const Syarikat = SyarikatModel(sequelize.sequelizeConn, seqlib);


DesignLogo.belongsTo(KodKedua, {foreignKey: 'id_jenis_kain', targetKey: 'id_kod_kedua', as: 'JenisKain'});
DesignLogo.belongsTo(KodKedua, {foreignKey: 'id_jenis_patch', targetKey: 'id_kod_kedua', as: 'JenisPatch'});
DesignLogo.belongsTo(KodKedua, {foreignKey: 'id_jenis_sulaman', targetKey: 'id_kod_kedua', as: 'JenisSulaman'});
DesignLogo.belongsTo(Syarikat, {foreignKey: 'id_syarikat', targetKey: 'id_syarikat', as: 'Syarikat'});

 
module.exports = DesignLogo;