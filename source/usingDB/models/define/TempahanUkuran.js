module.exports = (sequelize, type) => {
    return sequelize.define('tempahanUkuran', {
        id_tempahan_ukuran : {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_kontrak : type.INTEGER,
        id_pemakai_tempahan : type.INTEGER,
        id_dsgn_pakaian : type.INTEGER,
        id_jenis_pakaian : type.INTEGER,
        bilangan : type.INTEGER,
        b_tengkuk_pinggang : type.DECIMAL,
        b_tengkuk_pinggang_pecahan : type.STRING,
        b_labuh : type.DECIMAL,
        b_labuh_pecahan : type.STRING,
        b_bahu : type.DECIMAL,
        b_bahu_pecahan : type.STRING,
        b_labuh_lengan : type.DECIMAL,
        b_labuh_lengan_pecahan : type.STRING,
        b_dada : type.DECIMAL,
        b_dada_pecahan : type.STRING,
        b_pinggang : type.DECIMAL,
        b_pinggang_pecahan : type.STRING,
        b_punggung : type.DECIMAL,
        b_punggung_pecahan : type.STRING,
        b_leher_baju : type.DECIMAL,
        b_leher_baju_pecahan : type.STRING,
        sl_labuh_seluar : type.DECIMAL,
        sl_labuh_seluar_pecahan : type.STRING,
        sl_pinggang : type.DECIMAL,
        sl_pinggang_pecahan : type.STRING,
        sl_punggung : type.DECIMAL,
        sl_punggung_pecahan : type.STRING,
        sl_peha : type.DECIMAL,
        sl_peha_pecahan : type.STRING,
        sl_lutut : type.DECIMAL,
        sl_lutut_pecahan : type.STRING,
        sl_buka_kaki : type.DECIMAL,
        sl_buka_kaki_pecahan : type.STRING,
        sl_cawat : type.DECIMAL,
        sl_cawat_pecahan : type.STRING,
        sz_kot_jaket : type.STRING,
        sz_baju : type.STRING,
        sz_blok_id : type.STRING,
        sz_seluar : type.STRING,
        nota : type.STRING,
        created_at : type.DATE,
        created_by : type.INTEGER,
        updated_at : type.DATE,
        updated_by : type.INTEGER,
        deleted_at : type.DATE,
        deleted_by : type.INTEGER
    }, {
        tableName: 'tempahan_ukuran',
        schema: process.env.SCHEMA,
        //timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true,


    });
}