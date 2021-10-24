module.exports = (sequelize, type) => {
    return sequelize.define('tempahanProduction', {
        id_tempahan_production : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_tempahan_ukuran : type.INTEGER, 
        barcode : type.STRING,
        is_potong : type.BOOLEAN,
        is_jahit : type.BOOLEAN,
        is_butang : type.BOOLEAN,
        is_sulam : type.BOOLEAN,
        is_qc : type.BOOLEAN,
        is_packing : type.BOOLEAN,
        status_potong : type.INTEGER,
        status_jahit : type.INTEGER,
        status_sulam : type.INTEGER,
        status_butang : type.INTEGER,
        status_qc : type.INTEGER,
        status_packaging : type.INTEGER,
        tarikh_mula_potong : type.DATE,
        tarikh_akhir_potong : type.DATE,
        tarikh_mula_sulam : type.DATE,
        tarikh_akhir_sulam : type.DATE,
        tarikh_mula_jahit : type.DATE,
        tarikh_akhir_jahit : type.DATE,
        tarikh_mula_butang : type.DATE,
        tarikh_akhir_butang : type.DATE,
        tarikh_mula_qc : type.DATE,
        tarikh_akhir_qc : type.DATE,
        tarikh_mula_packaging : type.DATE,
        tarikh_akhir_packaging : type.DATE,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
        }, {
        tableName: 'tempahan_production',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true,


    });
}