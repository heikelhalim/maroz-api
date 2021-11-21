module.exports = (sequelize, type) => {
    return sequelize.define('deliveryorder', {
        id_do : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        no_rujukan_do : type.STRING,
        tarikh_hantar : type.DATE,
        status : type.INTEGER,
        id_kontrak : type.INTEGER,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'delivery_order',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}