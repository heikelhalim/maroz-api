module.exports = (sequelize, type) => {
    return sequelize.define('userJob', {
        id_user_job : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_pengguna : type.INTEGER,
        id_job : type.INTEGER,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'sys_user_job',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}