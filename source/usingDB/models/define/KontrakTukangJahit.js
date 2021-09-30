module.exports = (sequelize, type) => {
    return sequelize.define('kontrakTukangJahit', {
        id_kontrak_tukang_jahit : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_kontrak : type.INTEGER,
        id_pengguna : type.INTEGER,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'kontrak_tukang_jahit',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}