module.exports = (sequelize, type) => {
    return sequelize.define('kadarUpahInvoice', {
        id_kadar_upah_invoice : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_kadar_upah : type.INTEGER,
        no_invoice : type.STRING,
        tarikh_invoice : type.DATE,
        jumlah_upah : type.DECIMAL,        
        dihantar_oleh : type.INTEGER,        
        created_at : type.DATE,
        updated_at : type.DATE,
        deleted_at : type.DATE,
        }, {
        tableName: 'kadar_upah_invoice',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}