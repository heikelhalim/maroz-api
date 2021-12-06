const seqlib = require('sequelize');
const sequelize = require('../../../../sequelize');

const KadarUpahInvoiceModel = require('../../models/define/KadarUpahInvoice');
const KadarUpahInvoice = KadarUpahInvoiceModel(sequelize.sequelizeConn, seqlib);

const KadarUpahModel = require('../../models/define/KadarUpah');
const KadarUpah = KadarUpahModel(sequelize.sequelizeConn, seqlib);

const PenggunaModel = require('../../models/define/User');
const Pengguna = PenggunaModel(sequelize.sequelizeConn, seqlib);


KadarUpahInvoice.belongsTo(Pengguna, {foreignKey: 'dihantar_oleh', targetKey: 'id_pengguna', as: 'Staf'});
KadarUpahInvoice.belongsTo(KadarUpah, {foreignKey: 'id_kadar_upah', targetKey: 'id_kadar_upah', as: 'KadarUpah'});


module.exports = KadarUpahInvoice;