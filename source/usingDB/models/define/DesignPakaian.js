module.exports = (sequelize, type) => {
    return sequelize.define('designPakaian', {
        id_dsgn_pakaian : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        kod_design : type.STRING,
        tarikh_design : type.DATE,
        keterangan : type.STRING,
        id_jenis_pakaian : type.INTEGER,
        id_jawatan : type.INTEGER,
        id_kategori : type.INTEGER,
        file_name : type.STRING,
        file_path : type.STRING,
        file_mimetype : type.STRING,
        file_original_name : type.STRING,
        created_at : type.DATE,
        created_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        id_logo : type.INTEGER,
        is_butang : type.BOOLEAN,
        is_sulam : type.BOOLEAN,
        is_qc : type.BOOLEAN,
        is_aktif : type.BOOLEAN,
        nota : type.STRING
        }, {
        tableName: 'dsgn_pakaian',
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