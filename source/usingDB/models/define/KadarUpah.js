module.exports = (sequelize, type) => {
    return sequelize.define('kadarUpah', {
        id_kadar_upah : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_kontrak : type.INTEGER,
        id_jenis_kerja : type.INTEGER,
        id_tukang : type.INTEGER,
        kadar_upah : type.DECIMAL,        
        created_at : type.DATE,
        updated_at : type.DATE,
        deleted_at : type.DATE,
        }, {
        tableName: 'kadar_upah',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}