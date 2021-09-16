module.exports = (sequelize, type) => {
    return sequelize.define('kodkedua', {
        id_kod_kedua : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_kod_utama : type.INTEGER,
        kod_ref : type.STRING,
        keterangan : type.STRING,
        is_aktif : type.BOOLEAN,
        catatan : type.STRING,
        created_at : type.DATE,
        updated_at : type.DATE,
        created_by : type.INTEGER,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
        }, {
        tableName: 'ref_kod_standard_kedua',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        scopes : {
            checkActive: {
                where: {
                    is_aktif: true
                }
            }
        }

    });
}