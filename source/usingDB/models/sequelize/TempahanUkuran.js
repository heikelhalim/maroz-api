
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');


const TempahanUkuranModel = require('../../models/define/TempahanUkuran');
const TempahanUkuran = TempahanUkuranModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);

const DesignPakaianModel = require('../../models/define/DesignPakaian');
const DesignPakaian = DesignPakaianModel(sequelize.sequelizeConn, seqlib);

const TempahanPemakaiModel = require('../../models/define/TempahanPemakai');
const TempahanPemakai = TempahanPemakaiModel(sequelize.sequelizeConn, seqlib);


 
// TempahanPemakai.belongsTo(Kontrak, {foreignKey: 'id_kontrak', targetKey: 'id_kontrak', as: 'Kontrak'});
TempahanUkuran.belongsTo(DesignPakaian, {foreignKey: 'id_dsgn_pakaian', targetKey: 'id_dsgn_pakaian', as: 'DesignPakaian'});
TempahanUkuran.belongsTo(KodKedua, {foreignKey: 'id_jenis_pakaian', targetKey: 'id_kod_kedua', as: 'JenisPakaian'});
TempahanUkuran.belongsTo(TempahanPemakai, {foreignKey: 'id_pemakai_tempahan', targetKey: 'id_pemakai_tempahan', as: 'Pemakai'});



module.exports = TempahanUkuran;