module.exports = (sequelize, type) => {
    return sequelize.define('kontrak', {
        id_kontrak : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },    
        id_dsgn_pakaian : type.INTEGER,
        kod_kontrak : type.STRING,
        id_jenis_kontrak : type.INTEGER,
        id_jenis_kerja : type.INTEGER,
        tajuk_kerja : type.STRING,
        tajuk_ringkas : type.STRING,
        tarikh_tutup : type.DATE,
        tarikh_hantar : type.DATE,
        no_tender : type.STRING,
        rujukan : type.STRING,
        hantar_oleh : type.STRING,
        sales_rep : type.STRING,
        id_syarikat : type.INTEGER,
        wakil_maroz : type.STRING,
        pegawai1 : type.STRING,
        pegawai2 : type.STRING,
        emel1 : type.STRING,
        emel2 : type.STRING,
        id_status_kontrak : type.INTEGER,
        sebab_tidak_awarded : type.STRING,
        tarikh_award : type.DATE,
        tarikh_mula : type.DATE,
        tarikh_potong : type.DATE,
        tarikh_siap : type.DATE,
        tarikh_jahit : type.DATE,
        tarikh_sulam_butang : type.DATE,
        is_partial_delivery : type.BOOLEAN,
        bilangan_hari : type.STRING,        
        created_at : type.DATE,
        updated_at : type.DATE,
        created_by : type.INTEGER,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
        }, {
        tableName: 'kontrak',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true

    });
}