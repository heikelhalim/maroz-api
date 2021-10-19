const KontrakModel = require("../../models/sequelize/Kontrak");
const KontrakTukangJahitModel = require("../../models/sequelize/KontrakTukangJahit");
const TempahanPemakaiModel = require("../../models/sequelize/TempahanPemakai");
const TempahanUkuranModel = require("../../models/sequelize/TempahanUkuran");
const SyarikatModel = require("../../models/sequelize/Syarikat");
const KodKeduaModel = require("../../models/sequelize/KodKedua");
const PenggunaModel = require("../../models/sequelize/User")

const DesignPakaianModel = require("../../models/sequelize/DesignPakaian");

const Helper = require("../../controller/Helper");
const { Op } = require("sequelize");
const moment = require("moment");



const Kontrak = {

    /**
    * SignUp
    * @param {object} req 
    * @param {object} res
    * @returns {object} user object 
    */
    async create(req, res) {
        try {

            const transaction = await KontrakModel.sequelize.transaction();

            var data = { 
                "id_dsgn_pakaian" : req.body.id_dsgn_pakaian,
                "kod_kontrak" : req.body.kod_kontrak,
                "id_jenis_kontrak" : req.body.id_jenis_kontrak,
                "id_jenis_kerja" : req.body.id_jenis_kerja,
                "tajuk_kerja" : req.body.tajuk_kerja,
                "tajuk_ringkas" : req.body.tajuk_ringkas,
                "tarikh_tutup" :  moment(req.body.tarikh_tutup).format('YYYY/MM/DD'),
                "tarikh_hantar" : moment(req.body.tarikh_hantar).format('YYYY/MM/DD'),
                "no_tender" : req.body.no_tender,
                "rujukan" : req.body.rujukan,
                "hantar_oleh" : req.body.hantar_oleh,
                "sales_rep" : req.body.sales_rep,
                "id_syarikat" : req.body.id_syarikat,
                "wakil_maroz" : req.body.wakil_maroz,
                "pegawai1" : req.body.pegawai1,
                "pegawai2" : req.body.pegawai2,
                "emel1" : req.body.emel1,
                "emel2" : req.body.emel2,
                "id_status_kontrak" : req.body.id_status_kontrak,
                "sebab_tidak_awarded" : req.body.sebab_tidak_awarded,
                "tarikh_award" : moment(req.body.tarikh_award).format('YYYY/MM/DD'),
                "tarikh_mula" : moment(req.body.tarikh_mula).format('YYYY/MM/DD'),
                "tarikh_potong" : moment(req.body.tarikh_potong).format('YYYY/MM/DD'),
                "tarikh_siap" : moment(req.body.tarikh_siap).format('YYYY/MM/DD'),
                "tarikh_jahit" : moment(req.body.tarikh_jahit).format('YYYY/MM/DD'),
                "tarikh_sulam_butang" : req.body.tarikh_sulam_butang,
                "is_partial_delivery" : req.body.is_partial_delivery,
                "bilangan_hari" : req.body.bilangan_hari,
                "id_status_proses_kontrak" : await Helper.getIdKodKedua("DRFT", 'ref_status_proses_kontrak')
            };


            var kontrak;
            if (req.body.id_kontrak)
            {
                //Update

                var existKontrak = await KontrakModel.findByPk(req.body.id_kontrak, {
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                    });


                if(!existKontrak)
                {
                    return res.status(404).send({'message': 'Detail logo tidak dijumpai'});
                }

                
                kontrak = await existKontrak.update(data, {
                    transaction : transaction
                }); 
                
                //delete tukangjahit
                const tj = await KontrakTukangJahitModel.destroy({
                    where : {"id_kontrak" : existKontrak.id_kontrak},
                    force : true,
                    transaction : transaction
                });

                //create new list tukang jahit
                if (req.body.tukang_jahit)
                {
                    if (req.body.tukang_jahit.length>0)
                    {
                        var arr_tj = [];
                        for (var tkgjahit of req.body.tukang_jahit)
                        {
                            var dataTJ = {
                                "id_kontrak" : existKontrak.id_kontrak,
                                "id_pengguna" : tkgjahit.id_pengguna
                            }

                            arr_tj.push(dataTJ);
                        }

                        const eksportRawatan = await KontrakTukangJahitModel.bulkCreate(arr_tj, {
                            transaction : transaction
                        });  
                    }                    
                }
                


            }
            else
            {
                //Create
                kontrak = await KontrakModel.create(data, {
                    transaction : transaction
                });    

                //create new list tukang jahit
                if (req.body.tukang_jahit)
                {
                    if (req.body.tukang_jahit.length>0)
                    {
                        var arr_tj = [];
                        for (var tkgjahit of req.body.tukang_jahit)
                        {
                            var dataTJ = {
                                "id_kontrak" : kontrak.id_kontrak,
                                "id_pengguna" : tkgjahit.id_pengguna
                            }

                            arr_tj.push(dataTJ);
                        }

                        const eksportRawatan = await KontrakTukangJahitModel.bulkCreate(arr_tj, {
                            transaction : transaction
                        });  
                    }                    
                }

            }


            await transaction.commit();
            return res.status(200).send(kontrak);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getList(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;

            //status kontrak
            var kod_status = ["draft", "hantar", "selesai"];
            
            var kod_kedua = {
                draft : "DRFT",
                selesai : "SLS",
                hantar : "HTR"
            };


            var kod_status_kod = "";
            var arr_status_cnt = [];

                //utk view penyemak
                for (var item of kod_status){  
                    var status_count = {};
                    switch(item) {
                        case "hantar":
                            kod_status_kod = kod_kedua.hantar; //hantar
                            break;
                        case "selesai":             
                            kod_status_kod = kod_kedua.selesai; // selesai
                            break;
                        case "draft":
                            kod_status_kod = kod_kedua.draft; // draft
                            break;
                        default:
                            kod_status_kod = kod_kedua.draft; // Baru dan Auto Lulus - Pending Penyemak
                    }
    
                    const showStatus = await KontrakModel.count({
                        include: [
                            {
                                model : KodKeduaModel,
                                as : 'StatusProsesKontrak',
                                required : true,
                                where : {
                                    kod_ref : kod_status_kod
                                },
                            },
                        ]
                    });
                    status_count["status"] = item;
                    status_count["cnt"] = showStatus;
                    arr_status_cnt.push(status_count);
                }  

                var kod;
                var kod_status;      
                
                switch(req.body.status_name) {
                    case "hantar":
                        kod_status = kod_kedua.hantar; //hantar
                        break;
                    case "selesai":             
                        kod_status = kod_kedua.selesai; // selesai
                        break;
                    case "draft":
                        kod_status = kod_kedua.draft; // draft
                        break;
                    default:
                        kod_status = kod_kedua.draft; // Baru dan Auto Lulus - Pending Penyemak
                }
                
                condition = {
                    'kod_ref' : kod_status ,
                    'is_aktif' : true
                };


 
            var listKontrak = await KontrakModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_kontrak', 'DESC']],
                where : Helper.filterJoin(req, [
                    {
                        model : KontrakModel,
                        columnsLike : [
                            'kod_kontrak',
                            'tajuk_kerja'
                        ],
                        columnsEqual : ['id_syarikat']
                    } 
                ], true),                
                include : [
                    {                                
                        model : KodKeduaModel,
                        as : 'StatusProsesKontrak',
                        required : true,
                        where : condition,
                        attributes: ['kod_ref','keterangan']                   
                    },
                    {                                
                        model : SyarikatModel,
                        as : 'Syarikat',
                        attributes: ['nama_syarikat','kod_syarikat']                    
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisKontrak',
                        attributes: ['kod_ref','keterangan']                   
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisKerja',
                        attributes: ['kod_ref','keterangan']                   
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisKerja',
                        attributes: ['kod_ref','keterangan']                   
                    },
                    {                                
                        model : KontrakTukangJahitModel,
                        as : 'ListTukangJahit',
                        attributes: ['id_kontrak'],
                        include : [
                            {                                
                                model : PenggunaModel,
                                as : 'TukangJahit',
                                attributes: ['nama']                   
                            },
                        ]                   
                    },                    

                ] 

            });
                            

            return res.status(200).send({
                'status_list' : arr_status_cnt,
                'totalSize' : listKontrak.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : listKontrak.rows,
            });


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getDetails(req, res) {
        try {

            var detailKontrak = await KontrakModel.findByPk(req.params.id,{
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                include : [
                    {                                
                        model : SyarikatModel,
                        as : 'Syarikat',
                        attributes: ['nama_syarikat','kod_syarikat']                    
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisKontrak',
                        attributes: ['kod_ref','keterangan']                   
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisKerja',
                        attributes: ['kod_ref','keterangan']                   
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisKerja',
                        attributes: ['kod_ref','keterangan']                   
                    },

                ] 
            });

            if (!detailKontrak){
                return res.status(404).send({'message': 'Details kontrak tidak dijumpai'});
            }

            return res.status(200).send(detailKontrak);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async deleteKontrak(req, res) {
        try {

            const transaction = await KontrakModel.sequelize.transaction();

            //Delete Tukang Jahit

            //Delete Ukuran Pemakai

            //Delete Tempahan Pemakai

            //Delete Kontrak
            const delKontrak = await KontrakModel.destroy({
                where : {
                    "id_kontrak" : req.params.id
                },
                force : true,
                transaction : transaction
            });
                
            console.log("DELETE");

            await transaction.commit();
            return res.status(200).send({ status : "delete" });
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },


    async assignPemakaiKontrak(req, res) {
        try {

            const transaction = await TempahanPemakaiModel.sequelize.transaction();


            var objRaw = [];
            for (var pemakai of req.body.pemakai)
            {

                //check pemakai dah dipilih utk kontrak ke belum
                var detailKontrak = await TempahanPemakaiModel.findOne({
                    attributes: { 
                                 exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                    },
                    where : {
                     "id_pemakai" : pemakai.id_pemakai,
                     "id_kontrak" : req.body.id_kontrak
                    }
                });


                if (!detailKontrak)
                {

                    var data = {
                        "id_pemakai" : pemakai.id_pemakai,
                        "id_kontrak" : req.body.id_kontrak,
                        "jenis_tempahan" : "kontrak",
                        "id_status" : await Helper.getIdKodKedua("BR", 'ref_status_tempahan_pemakai'),   //Baru
                    }
    
                    objRaw.push(data);
                }


            }

            var listPemakaiKontrak;
            if (Object.keys(objRaw).length){

                listPemakaiKontrak = await TempahanPemakaiModel.bulkCreate(objRaw, {
                    transaction : transaction
                });  

            }


            await transaction.commit();
            return res.status(200).send(listPemakaiKontrak);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },


    async createPemakai(req, res) {
        try {

            const transaction = await TempahanPemakaiModel.sequelize.transaction();

            var body = req.body;

            console.log(body);
            var data = { 
                "nama" : body.nama,
                "no_kpstaff" : body.no_kpstaff,
                "kod_buku" : body.kod_buku,
                "jantina" : body.jantina,
                "nama_tag" : body.nama_tag,
                "no_telefon" : body.no_telefon,
                "id_tukang_ukur" : body.id_tukang_ukur,
                "tarikh_ukur" :  moment(body.tarikh_ukur).format('YYYY/MM/DD'),
                "jawatan" : body.jawatan,
                "id_kontrak" : body.id_kontrak,
                "jenis_tempahan" : "kontrak",
                "id_status" : await Helper.getIdKodKedua("BR", 'ref_status_tempahan_pemakai'),   //Baru
            };

 
            var pemakai;
            if (req.body.id_pemakai_tempahan)
            {
                //Update

                var existPemakai = await TempahanPemakaiModel.findByPk(req.body.id_pemakai_tempahan, {
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                    });


                if(!existPemakai)
                {
                    return res.status(404).send({'message': 'Detail pemakai tidak dijumpai'});
                }

                
                pemakai = await existPemakai.update(data, {
                    transaction : transaction
                }); 
                
            }
            else
            {
                //Create
                pemakai = await TempahanPemakaiModel.create(data, {
                    transaction : transaction
                });    


            }


            await transaction.commit();
            return res.status(200).send(pemakai);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getDetailsPemakai(req, res) {
        try {

            var detailPemakai = await TempahanPemakaiModel.findByPk(req.params.id,{
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },                          
                include: [
                    {
                        model : PenggunaModel,
                        as : 'TukangUkur',
                        attributes : ["nama"]
                    },
                ]
            });

            if (!detailPemakai){
                return res.status(404).send({'message': 'Details pemakai tidak dijumpai'});
            }

            return res.status(200).send(detailPemakai);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getListPemakaiKontrak(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;

            //status kontrak
            var kod_status = ["baru", "proses", "selesai"];
            
            var kod_kedua = {
                baru : "BR",
                selesai : "SLS",
                proses : "PRS"
            };


            var kod_status_kod = "";
            var arr_status_cnt = [];

                //utk view penyemak
                for (var item of kod_status){  
                    var status_count = {};
                    switch(item) {
                        case "proses":
                            kod_status_kod = kod_kedua.proses; //proses
                            break;
                        case "selesai":             
                            kod_status_kod = kod_kedua.selesai; // selesai
                            break;
                        case "baru":
                            kod_status_kod = kod_kedua.baru; // baru
                            break;
                        default:
                            kod_status_kod = kod_kedua.baru; // Baru dan Auto Lulus - Pending Penyemak
                    }
    
                    const showStatus = await TempahanPemakaiModel.count({
                        where : {id_kontrak : req.body.id_kontrak},
                        include: [
                            {
                                model : KodKeduaModel,
                                as : 'StatusPemakai',
                                required : true,
                                where : {
                                    kod_ref : kod_status_kod
                                },
                            },
                        ]
                    });
                    status_count["status"] = item;
                    status_count["cnt"] = showStatus;
                    arr_status_cnt.push(status_count);
                }  


                var condition = {};

                if (req.body.status_name)
                {                
                    var kod_status;      
                
                    switch(req.body.status_name) {
                        case "proses":
                            kod_status = kod_kedua.proses; //hantar
                            break;
                        case "selesai":             
                            kod_status = kod_kedua.selesai; // selesai
                            break;
                        case "baru":
                            kod_status = kod_kedua.baru; // draft
                            break;
                        default:
                            kod_status = kod_kedua.baru; // Baru dan Auto Lulus - Pending Penyemak
                    }
                    
                    condition = {
                        'kod_ref' : kod_status ,
                        'is_aktif' : true
                    };

                }




 
            var listPemakai = await TempahanPemakaiModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_kontrak', 'DESC']],
                where : {
                    [Op.and] : [ 
                        Helper.filterJoin(req, [
                            {
                                model : KontrakModel,
                                columnsLike : [
                                    'kod_kontrak',
                                    'tajuk_kerja'
                                ],
                                columnsEqual : ['id_syarikat']
                            } 
                        ], true),
                        { id_kontrak : req.body.id_kontrak } 
                     ]
                },
               
                include : [
                    {                                
                        model : KodKeduaModel,
                        as : 'StatusPemakai',
                        required : true,
                        where : condition,
                        attributes: ['kod_ref','keterangan']                   
                    },
                    {
                        model : PenggunaModel,
                        as : 'TukangUkur',
                        attributes : ["nama"]
                    },                                                       
                ] 

            });
                            

            return res.status(200).send({
                'status_list' : arr_status_cnt,
                'totalSize' : listPemakai.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : listPemakai.rows,
            });


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },    


    async createTempahan(req, res) {
        try {

            const transaction = await TempahanUkuranModel.sequelize.transaction();


            var body = req.body;

            var data = { 
                // "id_kontrak" : body.id_kontrak,
                "id_pemakai_tempahan" : body.id_pemakai_tempahan,
                "id_dsgn_pakaian" : body.id_dsgn_pakaian,
                "id_jenis_pakaian" : body.id_jenis_pakaian,
                "bilangan" : body.bilangan,
                "b_tengkuk_pinggang" : body.b_tengkuk_pinggang,
                "b_tengkuk_pinggang_pecahan" : body.b_tengkuk_pinggang_pecahan,
                "b_labuh" : body.b_labuh,
                "b_labuh_pecahan" : body.b_labuh_pecahan,
                "b_bahu" : body.b_bahu,
                "b_bahu_pecahan" : body.b_bahu_pecahan,
                "b_labuh_lengan" : body.b_labuh_lengan,
                "b_labuh_lengan_pecahan" : body.b_labuh_lengan_pecahan,
                "b_dada" : body.b_dada,
                "b_dada_pecahan" : body.b_dada_pecahan,
                "b_pinggang" : body.b_pinggang,
                "b_pinggang_pecahan" : body.b_pinggang_pecahan,
                "b_punggung" : body.b_punggung,
                "b_punggung_pecahan" :body.b_punggung_pecahan,
                "b_leher_baju" : body.b_leher_baju,
                "b_leher_baju_pecahan" : body.b_leher_baju_pecahan,
                "sl_labuh_seluar" : body.sl_labuh_seluar,
                "sl_labuh_seluar_pecahan" : body.sl_labuh_seluar_pecahan,
                "sl_pinggang" : body.sl_pinggang,
                "sl_pinggang_pecahan" : body.sl_pinggang_pecahan,
                "sl_punggung" : body.sl_punggung,
                "sl_punggung_pecahan" : body.sl_punggung_pecahan,
                "sl_peha" : body.sl_peha,
                "sl_peha_pecahan" : body.sl_peha_pecahan,
                "sl_lutut" : body.sl_lutut,
                "sl_lutut_pecahan" : body.sl_lutut_pecahan,
                "sl_buka_kaki" : body.sl_buka_kaki,
                "sl_buka_kaki_pecahan" : body.sl_buka_kaki_pecahan,
                "sl_cawat" : body.sl_cawat,
                "sl_cawat_pecahan" : body.sl_cawat_pecahan,
                "sz_kot_jaket" : body.sz_kot_jaket,
                "sz_baju" : body.sz_baju,
                "sz_blok_id" : body.sz_blok_id,
                "sz_seluar" : body.sz_seluar,
                "nota" : body.nota
            };


            var ukuran;
            if (req.body.id_tempahan_ukuran)
            {
                //Update

                var existUkuran = await TempahanUkuranModel.findByPk(req.body.id_tempahan_ukuran, {
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                    });


                if(!existUkuran)
                {
                    return res.status(404).send({'message': 'Detail ukuran tidak dijumpai'});
                }

                
                ukuran = await existUkuran.update(data, {
                    transaction : transaction
                }); 
                
            }
            else
            {
                //Create
                ukuran = await TempahanUkuranModel.create(data, {
                    transaction : transaction
                });    


            }


            await transaction.commit();
            return res.status(200).send(ukuran);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getListTempahanPemakai(req, res) {
        try {



            var listTempahan = await TempahanUkuranModel.findAll({
                subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                where : { id_pemakai_tempahan : req.body.id_pemakai_tempahan },
                order : [['id_tempahan_ukuran', 'DESC']],              
                include : [
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisPakaian',
                        attributes: ['kod_ref','keterangan']                   
                    },
                    {
                        model : DesignPakaianModel,
                        as : 'DesignPakaian',
                        attributes: { 
                            exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                        include : [
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisPakaian',
                                attributes: ['kod_ref','keterangan']                   
                            },
                        ]
                    },                                                       
                ] 

            });
            return res.status(200).send({
                // 'status_list' : arr_status_cnt,
                // 'sizePerPage' : pageSize,
                // 'page' : page,
                'data' : listTempahan,
            });


            
        } catch (error) {
            
        }
    },
    
    
    async deletePemakaiKontrak(req, res) {
        try {

            const transaction = await TempahanPemakaiModel.sequelize.transaction();


            for (var pemakai of req.body.pemakai)
            {

                var maklumatPemakaiKontrak = await TempahanPemakaiModel.findOne({
                    where : {
                        "id_pemakai" : pemakai.id_pemakai,
                        "id_kontrak" : req.body.id_kontrak
                    },
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                    });



                //Delete All Tempahan Ukuran
                
                const delTempahan = await TempahanUkuranModel.destroy({
                    where : {
                        "id_pemakai_tempahan" : maklumatPemakaiKontrak.id_pemakai_tempahan
                    },
                    force : true,
                    transaction : transaction
                });


                //Delete Pemakai assigne to kontrak

                const delPemakai = await TempahanPemakaiModel.destroy({
                    where : {
                        "id_pemakai_tempahan" : maklumatPemakaiKontrak.id_pemakai_tempahan
                    },
                    force : true,
                    transaction : transaction
                });
                
                console.log("DELETE");

            }

            await transaction.commit();
            return res.status(200).send({ status : "delete" });
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async hantarKontrak(req,res){
        try {
            
            // change status kontrak to hantar

            var data = {
                "id_status_proses_kontrak" : await Helper.getIdKodKedua("HTR", 'ref_status_proses_kontrak')
            }

            var existKontrak = await KontrakModel.findByPk(req.body.id_kontrak, {
                attributes: { 
                    exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                    },
                });

                if(!existKontrak)
                {
                    return res.status(404).send({'message': 'Detail kontrak tidak dijumpai'});
                }

                
                kontrak = await existKontrak.update(data, {
                    transaction : transaction
                });                 

            // insert tempahan to production with barcode generate



            // 

        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    }

}

module.exports = Kontrak;