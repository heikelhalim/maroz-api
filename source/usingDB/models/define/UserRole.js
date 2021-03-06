module.exports = (sequelize, type) => {
    return sequelize.define('userRole', {
        id_user_role : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_pengguna : type.INTEGER,
        id_role : type.INTEGER,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'sys_user_role',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}