
const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const UserJobModel = require('../../models/define/UserJob');
const UserJob = UserJobModel(sequelize.sequelizeConn, seqlib);

const KodKeduaModel = require('../../models/define/KodKedua');
const KodKedua = KodKeduaModel(sequelize.sequelizeConn, seqlib);

 
 
UserJob.belongsTo(KodKedua, {foreignKey: 'id_job', targetKey: 'id_kod_kedua', as: 'JenisJob'});



module.exports = UserJob;