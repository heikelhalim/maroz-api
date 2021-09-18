
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const DesignPakaianModel = require('../../models/define/DesignPakaian');
const DesignPakaian = DesignPakaianModel(sequelize.sequelizeConn, seqlib);

const DesignLogoModel = require('../../models/define/DesignLogo');
const DesignLogo = DesignLogoModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);


DesignPakaian.belongsTo(KodKedua, {foreignKey: 'id_jawatan', targetKey: 'id_kod_kedua', as: 'Jawatan'});
DesignPakaian.belongsTo(KodKedua, {foreignKey: 'id_jenis_pakaian', targetKey: 'id_kod_kedua', as: 'JenisPakaian'});
DesignPakaian.belongsTo(KodKedua, {foreignKey: 'id_kategori', targetKey: 'id_kod_kedua', as: 'Kategori'});
DesignPakaian.belongsTo(DesignLogo, {foreignKey: 'id_logo', targetKey: 'id_logo', as: 'Logo'});

 
module.exports = DesignPakaian;