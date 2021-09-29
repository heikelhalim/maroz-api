module.exports = (sequelize, type) => {
    return sequelize.define('role', {
        id_role : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama : type.STRING,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'sys_role',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}