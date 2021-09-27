module.exports = (sequelize, type) => {
    return sequelize.define('tempahanPemakan', {
        id_pemakai_tempahan : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_pemakai : type.INTEGER,
        id_status : type.INTEGER,
        id_kontrak : type.INTEGER,
        jenis_tempahan : type.STRING,  
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'tempahan_pemakai',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true,


    });
}