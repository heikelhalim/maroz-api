const KontrakModel = require("../../models/sequelize/Kontrak");
const KontrakTukangJahitModel = require("../../models/sequelize/KontrakTukangJahit");
const TempahanPemakaiModel = require("../../models/sequelize/TempahanPemakai");
const SyarikatModel = require("../../models/sequelize/Syarikat");
const KodKeduaModel = require("../../models/sequelize/KodKedua");
const PenggunaModel = require("../../models/sequelize/User")
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
                        ]
                    },
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

    async deletePemakaiKontrak(req, res) {
        try {

            const transaction = await TempahanPemakaiModel.sequelize.transaction();


            for (var pemakai of req.body.pemakai)
            {

                const delTempahan = await TempahanPemakaiModel.destroy({
                    where : {
                        "id_pemakai" : pemakai.id_pemakai,
                        "id_kontrak" : req.body.id_kontrak
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


}

module.exports = Kontrak;