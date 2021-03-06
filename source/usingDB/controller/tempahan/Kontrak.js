const KontrakModel = require("../../models/sequelize/Kontrak");
const KontrakTukangJahitModel = require("../../models/sequelize/KontrakTukangJahit");
const TempahanPemakaiModel = require("../../models/sequelize/TempahanPemakai");
const TempahanUkuranModel = require("../../models/sequelize/TempahanUkuran");
const SyarikatModel = require("../../models/sequelize/Syarikat");
const KodKeduaModel = require("../../models/sequelize/KodKedua");
const PenggunaModel = require("../../models/sequelize/User")

const DesignPakaianModel = require("../../models/sequelize/DesignPakaian");
const TempahanProductionModel = require("../../models/sequelize/TempahanProduction");


const Helper = require("../../controller/Helper");
const { Op } = require("sequelize");
const moment = require("moment");
const TempahanProduction = require("../../models/sequelize/TempahanProduction");



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
                "tarikh_tutup" :  req.body.tarikh_tutup || null,
                "tarikh_hantar" : req.body.tarikh_hantar || null,
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
                // "tarikh_award" : req.body.tarikh_award || null,
                // "tarikh_mula" : req.body.tarikh_mula || null,
                // "tarikh_potong" : req.body.tarikh_potong || null,
                // "tarikh_siap" : req.body.tarikh_siap || null,
                // "tarikh_jahit" : req.body.tarikh_jahit || null,
                // "tarikh_sulam_butang" : req.body.tarikh_sulam_butang || null,
                // "is_partial_delivery" : req.body.is_partial_delivery,
                "bilangan_hari" : req.body.bilangan_hari,
                "id_status_proses_kontrak" : await Helper.getIdKodKedua("DRFT", 'ref_status_proses_kontrak'),
                "kiraan" : req.body.kiraan,
                "tahun" : req.body.tahun
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
                    {                                
                        model : KodKeduaModel,
                        as : 'StatusPemakai',
                        required : true,
                        attributes: ['kod_ref','keterangan']                   
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
                                columnsEqual : ['id_syarikat','id_status']
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
                "sz_armhole" : body.sz_armhole,
                "sz_lengan" : body.sz_lengan,
                "sz_kaf" : body.sz_kaf,

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
                data["kod_tempahan"] = await Helper.genRunningNo("kod_tempahan");
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

    async deleteTempahan(req, res) {
        try {



            if (req.body.tempahans.length>0)
            {

                const transaction = await TempahanUkuranModel.sequelize.transaction();

                for (var tempahan of req.body.tempahans)
                {
    
                    //Delete All Tempahan Ukuran

                    
                    const delTempahan = await TempahanUkuranModel.destroy({
                        where : {
                            "id_tempahan_ukuran" : tempahan.id_tempahan_ukuran
                        },
                        force : true,
                        transaction : transaction
                    });
                    
                }

                await transaction.commit();
            }


            return res.status(200).send({ status : "delete" });
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
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getListTempahanUkuran(req, res) {
        try {


            var modelPemakai = {
                model : TempahanPemakaiModel,
                as : "Pemakai",
                required : true,
                attributes: { 
                    exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                include : [
                    {
                        model : KontrakModel,
                        as : "Kontrak",
                        required : true, 
                        attributes : ["id_kontrak","kod_kontrak"],
                        include : [
                            {                                
                                model : SyarikatModel,
                                as : 'Syarikat',
                                attributes: ['nama_syarikat','kod_syarikat']                    
                            }
                        ]               
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'StatusPemakai',
                        required : true,
                        attributes: ['kod_ref','keterangan']                   
                    }                                                           
                ]
                
            }

            var arrayCondition = [
                Helper.filterJoin(req, [
                    {
                        model : KontrakModel,
                        columnsLike : [
                            'kod_kontrak',
                            'tajuk_kerja'
                        ],
                        columnsEqual : ['id_syarikat','id_status']
                    } 
                ], true)
            ]


            if (req.body.jenisPage == "confirmTempahan")
            {
                // modelPemakai["where"] = { "id_status" : await Helper.getIdKodKedua("BR", 'ref_status_tempahan_pemakai') }

                arrayCondition.push({ is_hantarprod : null })                
            }

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;


            var listTempahan = await TempahanUkuranModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),   
                // where : Helper.filterJoin(req, [
                //     {
                //         model : TempahanUkuranModel,
                //         columnsLike : [
                //             'kod_tempahan'                        
                //         ]
                //     },
                //     {
                //         model : TempahanPemakaiModel,
                //         columnsLike : [
                //             'nama',     
                //             'no_telefon'                   
                //         ],
                //         joinAlias : 'Pemakai'
                //     },
                //     {
                //         model : KontrakModel,
                //         columnsEqual : ['id_kontrak'],
                //         joinAlias : 'Pemakai->Kontrak'
                //     },                    
                //     {
                //         model : DesignPakaianModel,
                //         columnsLike : [
                //             'kod_design'                        
                //         ],
                //         joinAlias : 'DesignPakaian'
                //     },

                // ], true),                      
                where : {
                    [Op.and] : arrayCondition
                },
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                order : [['id_tempahan_ukuran', 'DESC']],              
                include : [
                    modelPemakai,                    
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
                'data' : listTempahan,
            });


            
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },
        
    async getStatusCountConfirmTempahan(req,res) {
        try {

            var listTempahan = await TempahanUkuranModel.count({
                subQuery: false,
                distinct : true,             
                order : [['id_kontrak', 'DESC']],                
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                order : [['id_tempahan_ukuran', 'DESC']],              
                include : [
                    {
                        model : TempahanPemakaiModel,
                        as : "Pemakai",
                        required : true,
                        where : { "id_status" : await Helper.getIdKodKedua("BR", 'ref_status_tempahan_pemakai') },
                        attributes: { 
                            exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                       },
                    },                                                                         
                ] 

            });          


            var listPotong = await TempahanProductionModel.count({
                subQuery: false,
                distinct : true,                  
                include : [
                    {
                        model : KodKeduaModel,
                        as : "StatusPotong",
                        required : true,
                        where : { 
                            'kod_ref' : "BEA" ,
                            'is_aktif' : true 
                        },
                        attributes: ['kod_ref','keterangan'] 
                    },
                ]

            });

            return res.status(200).send(
                {
                    "countPending" : listTempahan,
                    "countPotong" : listPotong,
                }
            );  
            
        } catch (error) {
            return res.status(400).send(error);
        }
    },
    
    async deletePemakaiKontrak(req, res) {
        try {



            if (req.body.pemakai.length>0)
            {

                const transaction = await TempahanPemakaiModel.sequelize.transaction();

                for (var pemakai of req.body.pemakai)
                {
    
                    //Delete All Tempahan Ukuran

                    
                    const delTempahan = await TempahanUkuranModel.destroy({
                        where : {
                            "id_pemakai_tempahan" : pemakai.id_pemakai_tempahan
                        },
                        force : true,
                        transaction : transaction
                    });
    
    
                    //Delete Pemakai assigne to kontrak
    
                    const delPemakai = await TempahanPemakaiModel.destroy({
                        where : {
                            "id_pemakai_tempahan" : pemakai.id_pemakai_tempahan
                        },
                        force : true,
                        transaction : transaction
                    });
                    
                }

                await transaction.commit();
            }


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
    },

    async hantarTempahan(req,res){
        try {
            
            const transaction = await TempahanProduction.sequelize.transaction();

            if (!req.body.id_kontrak)
            {
                console.log("Takde value");
                return res.status(403).send({ "message" : "value id_kontrak is invalid" });
            }

            var idProses = await Helper.getIdKodKedua("PRS", 'ref_status_tempahan_pemakai')

            if (req.body.isFullHantar) //hantar semua tempahan
            {
                //get semua tempahan kontrak
                var listtempahan = await TempahanUkuranModel.findAll({
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                    },                    
                    include : [
                        {                                
                            model : TempahanPemakaiModel,
                            as : 'Pemakai',
                            required: true,
                            attributes: { 
                                exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                            },
                            where : { id_kontrak : req.body.id_kontrak }
                  
                        },
                    ]
                });
 
                var arr_Tempahan = [];


                for(var tempahan of listtempahan)
                {
                    //check if tempahan ni dah create kat production
                    var listukuranProd = await TempahanProductionModel.findAll({ where : { id_tempahan_ukuran : tempahan.id_tempahan_ukuran } })

                    //get design pakaian 
                    var dsgnPakaian = await DesignPakaianModel.findByPk( tempahan.id_dsgn_pakaian,{
                        attributes: { 
                            exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                            },
                    });
              
                    if (listukuranProd.length==0)
                    {
                        //Create tempahan production based on bilangan tempahan
                        var bil_tempahan = parseInt(tempahan.bilangan);
                    
                        if (tempahan.bilangan) //only kalau ada bilangan
                        {
                            for (var i=0; i < bil_tempahan ; i++ )
                            {
                                //generate barcode
                                var barcode = await Helper.genRunningNo("barcode_tempahan");

                                var dataProd = {
                                    "id_tempahan_ukuran" : tempahan.id_tempahan_ukuran,
                                    "id_kontrak" : req.body.id_kontrak,
                                    "barcode" : barcode,
                                    "status_potong" : await Helper.getIdKodKedua("BEA", 'ref_status_production'),
                                    "is_potong" : true,
                                    "is_jahit" : true,
                                    "is_butang" : dsgnPakaian.is_butang,
                                    "is_sulam" : dsgnPakaian.is_sulam,
                                    "is_qc" : dsgnPakaian.is_qc,
                                    "is_packaging" : true,

                                };

                                arr_Tempahan.push(dataProd);                        
                            }

                            //Update status ukuran sudah hantar ke Prod
                            const dataUpdate = {
                                is_hantarprod : true
                            }

                            await TempahanUkuranModel.update(dataUpdate,{
                                where : { id_tempahan_ukuran : tempahan.id_tempahan_ukuran },
                                transaction : transaction
                            })

                        }



                        //Update status pemakai baru --> proses
                        var existPemakai = await TempahanPemakaiModel.findByPk(tempahan.id_pemakai_tempahan, {
                            attributes: { 
                                exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                                },
                            });
                        
                        await existPemakai.update({ id_status : idProses }, {
                                transaction : transaction
                        }); 
                    }
                    else
                    {
                        console.log("VALUE DAH ADA");
                    }

                }

                if (arr_Tempahan.length>0)
                {
                    const eksportRawatan = await TempahanProductionModel.bulkCreate(arr_Tempahan, {
                        transaction : transaction
                    });  
                }
 

                    
            }
            else //hantar partial tempahan
            {
                var lisTempahan = req.body.listTempahan;

                if (lisTempahan)
                {
                    if (lisTempahan.length>0)
                    {

                        var arr_Tempahan = [];
                        for (var idtempahan of lisTempahan){

                            var tempukuran = await TempahanUkuranModel.findByPk(idtempahan,{
                                attributes: { 
                                    exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                                },
                                include : [
                                    {
                                        model : TempahanPemakaiModel,
                                        as : "Pemakai",
                                        required : true,
                                        attributes: { 
                                            exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                                       }
                                    }
                                ]
                            })

                            //check if tempahan ni dah create kat production
                            var listukuranProd = await TempahanProductionModel.findAll({ where : { id_tempahan_ukuran : tempukuran.id_tempahan_ukuran } })

                            //get design pakaian 
                            var dsgnPakaian = await DesignPakaianModel.findByPk( tempukuran.id_dsgn_pakaian,{
                                attributes: { 
                                    exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                                    },
                            });
                    
                            if (listukuranProd.length==0)
                            {
                                //Create tempahan production based on bilangan tempahan
                                var bil_tempahan = parseInt(tempukuran.bilangan);
                            
                                if (tempukuran.bilangan) //only kalau ada bilangan
                                {
                                    for (var i=0; i < bil_tempahan ; i++ )
                                    {
                                        //generate barcode
                                        var barcode = await Helper.genRunningNo("barcode_tempahan");

                                        var dataProd = {
                                            "id_tempahan_ukuran" : tempukuran.id_tempahan_ukuran,
                                            "id_kontrak" : tempukuran.Pemakai.id_kontrak,
                                            "barcode" : barcode,
                                            "status_potong" : await Helper.getIdKodKedua("BEA", 'ref_status_production'),
                                            "is_potong" : true,
                                            "is_jahit" : true,
                                            "is_butang" : dsgnPakaian.is_butang,
                                            "is_sulam" : dsgnPakaian.is_sulam,
                                            "is_qc" : dsgnPakaian.is_qc,
                                            "is_packaging" : true,

                                        };

                                        arr_Tempahan.push(dataProd);                        
                                    }
                                }

                                //Update status pemakai baru --> proses
                                var existPemakai = await TempahanPemakaiModel.findByPk(tempukuran.id_pemakai_tempahan, {
                                    attributes: { 
                                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                                        },
                                    });
                                
                                await existPemakai.update({ id_status : idProses }, {
                                        transaction : transaction
                                }); 
                            }
                        }

                        if (arr_Tempahan.length>0)
                        {
                            const eksportRawatan = await TempahanProductionModel.bulkCreate(arr_Tempahan, {
                                transaction : transaction
                            });  
                        }
                        
                    }
                }
            }

            await transaction.commit();
            return res.status(200).send({ "mesej" : "Success hantar"});

        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async generateNoKontrak(req,res){
        try {
            
            var currentYear = moment(new Date()).format('YYYY');
            
            var existKontrak = await KontrakModel.findAll({
                where : {
                    tahun : currentYear,
                    id_syarikat : req.params.id
                },
                attributes : ['kod_kontrak','tahun','kiraan'],
                limit : 1,
                order : [['kiraan', 'DESC']]
            })

            var syarikat = await SyarikatModel.findOne({
                where : {id_syarikat : req.params.id}
            });

            var runningNo = "";

            var intergerNo;

            if (existKontrak.length==0)
            {
                //tiada kontrak pada tahun tersebut, create no kontrak pertama
                runningNo = syarikat.kod_syarikat+"/"+currentYear+"/"+"01";
                intergerNo  = 1;
            }
            else
            {
                
                var newNo = existKontrak[0].kiraan + 1;
                intergerNo = newNo;
                
                var n  = newNo.toString().length;

                for (var i=0; i < 2-n ; i++)
                {
                    newNo = "0"+newNo;
                }

                runningNo = syarikat.kod_syarikat+"/"+currentYear+"/"+newNo;


            }

            return res.status(200).send({ 
                "no_kontrak" : runningNo,
                "tahun" : currentYear,
                "kiraan" : intergerNo
            });


        } catch (error) {
            return false;
        }
    }


}

module.exports = Kontrak;