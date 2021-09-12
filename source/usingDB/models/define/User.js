module.exports = (sequelize, type) => {
    return sequelize.define('user', {
        id_pengguna : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama_pengguna : {
            type: type.STRING,
            comment: "I'm a table comment!"
        },
        katalaluan : type.STRING,
        nama : type.STRING,
        email : type.STRING,
        isActive : type.BOOLEAN,
        status : type.INTEGER,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'sys_user',
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