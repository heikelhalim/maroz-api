module.exports = (sequelize, type) => {
    return sequelize.define('page', {
        id_page : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name : type.STRING,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'sys_page',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}