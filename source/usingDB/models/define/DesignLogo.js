module.exports = (sequelize, type) => {
    return sequelize.define('designLogo', {
        id_logo : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        kod_logo : type.STRING,
        keterangan : type.STRING,
        id_jenis_logo : type.INTEGER,
        id_jenis_sulaman : type.INTEGER,
        file_name : type.STRING,
        file_path : type.STRING,
        is_aktif : type.BOOLEAN,
        created_at : type.DATE,
        created_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        tarikh_logo : type.DATE,
        id_syarikat : type.INTEGER,
        base_warna : type.STRING,
        id_jenis_kain : type.INTEGER,
        warna_teks : type.STRING,
        warna_border : type.STRING,
        text : type.STRING,
        font : type.STRING,
        style : type.STRING,
        nota : type.STRING,

        }, {
        tableName: 'design_logo',
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