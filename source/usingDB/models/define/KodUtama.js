module.exports = (sequelize, type) => {
    return sequelize.define('kodUtama', {
        id_kod_utama : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama : type.STRING,
        catatan : type.STRING,
        created_at : type.DATE,
        updated_at : type.DATE,
        created_by : type.INTEGER,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
        }, {
        tableName: 'ref_kod_standard_utama',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}