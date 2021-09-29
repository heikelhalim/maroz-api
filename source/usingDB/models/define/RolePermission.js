module.exports = (sequelize, type) => {
    return sequelize.define('rolePermission', {
        id_role_permission : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_page : type.INTEGER,
        id_role : type.INTEGER,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'sys_role_permission',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}