module.exports = (sequelize, type) => {
    return sequelize.define('user', {
        id_pemakai : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        kod_buku : type.STRING,
        no_kp : type.STRING,
        nama : type.STRING,
        jawatan : type.STRING,
        is_active : type.BOOLEAN,
        status : type.INTEGER,
        jantina : type.STRING,
        nama_tag : type.STRING,
        no_telefon : type.STRING,
        email : type.STRING,
        id_syarikat : type.INTEGER,
        is_staf_syarikat : type.BOOLEAN,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'sys_pemakai',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        scopes : {
            checkActive: {
                where: {
                    isActive: true
                }
            }
        }

    });
}