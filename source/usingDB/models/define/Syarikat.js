module.exports = (sequelize, type) => {
    return sequelize.define('syarikat', {
        id_syarikat : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        kod_syarikat : type.STRING,
        nama_syarikat : type.STRING,
        alamat1 : type.STRING,
        alamat2 : type.STRING,
        alamat3 : type.STRING,
        poskod : type.STRING,
        daerah : type.STRING,
        id_negeri : type.STRING,
        id_jenis_perniagaan : type.INTEGER,
        emel : type.STRING,
        no_telefon : type.STRING,
        no_faks : type.STRING,
        is_aktif : type.BOOLEAN,
        created_at : type.DATE,
        updated_at : type.DATE,
        created_by : type.INTEGER,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
        }, {
        tableName: 'sys_syarikat',
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