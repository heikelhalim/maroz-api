const KadarUpahModel = require("../../models/sequelize/KadarUpah");
const KadarUpahInvoiceModel = require("../../models/sequelize/KadarUpahInvoice");
const PenggunaModel = require("../../models/sequelize/User")
const KontrakModel = require("../../models/sequelize/Kontrak");
const TempahanProductionModel = require("../../models/sequelize/TempahanProduction");
const TempahanUkuranModel = require("../../models/sequelize/TempahanUkuran");
const TempahanPemakaiModel = require("../../models/sequelize/TempahanPemakai");
const KodKeduaModel = require("../../models/sequelize/KodKedua");
const Helper = require("../Helper");
const { Op } = require("sequelize");
const moment = require("moment");



const KadarUpah = {


    async getList(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;
 
            var body = req.body


            //status kontrak
            var kod_kerja = ["potong","jahit","butang","sulam"];
            
            var kod_kedua = {
                potong : "PTG",
                jahit : "JHT",
                butang : "BTG",
                sulam : "SLM"
            };


            var kod_status_kod = "";
            var arr_status_cnt = [];

            for (var item of kod_kerja){  
                var status_count = {};
                switch(item) {
                    case "potong":
                        kod_status_kod = kod_kedua.potong; 
                        break;
                    case "jahit":             
                        kod_status_kod = kod_kedua.jahit;  
                        break;
                    case "butang":
                        kod_status_kod = kod_kedua.butang;  
                        break;
                    case "sulam":
                        kod_status_kod = kod_kedua.sulam;  
                }

                const showStatus = await KadarUpahModel.count({
                    include: [
                        {
                            model : KodKeduaModel,
                            as : 'JenisKerja',
                            required : true,
                            where : {
                                kod_ref : kod_status_kod
                            },
                        },
                    ]
                });
                status_count["jenis_kerja"] = item;
                status_count["cnt"] = showStatus;
                arr_status_cnt.push(status_count);
            }  


            var condition = {};

            if (body.jenis_kerja)
            {                
                var kod_status;      
            
                switch(body.jenis_kerja) {
                    case "potong":
                        kod_status = kod_kedua.potong; 
                        break;
                    case "jahit":             
                        kod_status = kod_kedua.jahit;  
                        break;
                    case "butang":
                        kod_status = kod_kedua.butang;  
                        break;
                    case "sulam":
                        kod_status = kod_kedua.sulam;  
                }
                
                condition = {
                    'kod_ref' : kod_status ,
                    'is_aktif' : true
                };

            }

            var kadarUpahList = await KadarUpahModel.findAndCountAll({
                where : Helper.filterJoin(req, [
                    {
                        model : PenggunaModel,
                        columnsLike : [
                            'nama',
                        ],
                        columnsEqual : ['id_pengguna'],
                        joinAlias : 'Tukang'
                    },
                ], true),
                subQuery: false, 
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_kadar_upah', 'DESC']],
                include : [
                    {                                
                        model : KontrakModel,
                        as : 'Kontrak',
                        required : true,
                        attributes: ['id_kontrak','kod_kontrak','tajuk_ringkas']                   
                    },
                    {                                
                        model : PenggunaModel,
                        as : 'Tukang',
                        required : true,
                        attributes: ['nama']                   
                    },                    
                    {
                        model : KodKeduaModel,
                        as : 'JenisKerja',
                        required : true,
                        where : condition,
                        attributes: ['kod_ref','keterangan']     
                    },                    
                    {
                        model : KodKeduaModel,
                        as : 'Status',
                        required : false,
                        attributes: ['kod_ref','keterangan']     
                    },     
                ]

            });
                            
            if (!kadarUpahList){
                return res.status(404).send({'message': 'List tidak dijumpai'});
            }


            var modifiedList = [];

            var statusSelesaiProd = await Helper.getIdKodKedua("SLS","ref_status_production"); //Selesai

            for (var item of kadarUpahList.rows)
            {
                //mapping bilangan tempahan selesai utk setiap kontrak per tukang
                var conditionProd = {}

                            
                switch(body.jenis_kerja) {
                    case "potong":
                        conditionProd["id_tukang_potong"] = item.id_tukang; 
                        conditionProd["status_potong"] = statusSelesaiProd; 
                        break;
                    case "jahit":             
                        conditionProd["id_tukang_jahit"] = item.id_tukang; 
                        conditionProd["status_jahit"] = statusSelesaiProd; 
                    break;
                    case "butang":
                        conditionProd["id_tukang_butang"] = item.id_tukang; 
                        conditionProd["status_butang"] = statusSelesaiProd; 
                        break;
                    case "sulam":
                        conditionProd["id_tukang_sulam"] = item.id_tukang; 
                        conditionProd["status_sulam"] = statusSelesaiProd;                         
                }
                            
                var details = await TempahanProductionModel.findAndCountAll({
                    subQuery: false,
                    distinct : true,
                    where : conditionProd,
                    include : [
                        {
                            model : TempahanUkuranModel,
                            as : "TempahanUkuran",
                            required : true,
                            attributes: ["id_tempahan_ukuran","id_pemakai_tempahan","id_dsgn_pakaian","id_jenis_pakaian","bilangan","kod_tempahan"],
                            include : [
                                {
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
                                            where : { id_kontrak : item.Kontrak.id_kontrak}
                                        }                                   
                                    ]
                                }                                
                            ]
                        }   
                    ]
                });


                item.dataValues.bilangan = details.count
                modifiedList.push(item);
            }
                            
            kadarUpahList.rows = modifiedList;


            return res.status(200).send({
                'jenis_kerja' : body.jenis_kerja,
                'jenis_kerja_list' : arr_status_cnt,
                'totalSize' : kadarUpahList.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : kadarUpahList.rows,
            });


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async updateKiraanUpah(req, res) {
        try {
            
            const transaction = await KadarUpahModel.sequelize.transaction();

            var existKadarUpah = await KadarUpahModel.findByPk(req.body.id_kadar_upah, {
                attributes: { 
                    exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                    },
                });


            if(!existKadarUpah)
            {
                return res.status(404).send({'message': 'Detail Kadar Upah tidak dijumpai'});
            }


            const data = {
                "kadar_upah" : req.body.kadar_upah
            }

            var kadarUpah = await existKadarUpah.update(data, {
                transaction : transaction
            }); 

            await transaction.commit();

            return res.status(200).send(kadarUpah);

        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async createInvoice(req, res) {
        try {
            
            const transaction = await KadarUpahInvoiceModel.sequelize.transaction();

            var body = req.body;

            if (body.arrayKadarUpah.length>0)
            {
                var arrayInvoice = []

                var statusSelesaiProd = await Helper.getIdKodKedua("SLS","ref_status_production"); //Selesai

                for (var kadarUpah of body.arrayKadarUpah)
                {
                    var noInvoice  = await Helper.genRunningNo("invoice")

                    var dataInvoice = {
                        "no_invoice" : noInvoice,
                        "tarikh_invoice" : moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
                        "jumlah_upah" : kadarUpah.jumlah_upah,
                        "dihantar_oleh" : req.decoded.id,
                        "id_kadar_upah" : kadarUpah.id_kadar_upah
                    }

                    arrayInvoice.push(dataInvoice);

                    //Change status kadar Upah

                    var dataUpah = { "id_status" : await Helper.getIdKodKedua("HTR","ref_status_kiraan_upah") }

                    await KadarUpahModel.update(dataUpah,{
                        where : { id_kadar_upah : kadarUpah.id_kadar_upah },
                        transaction : transaction 
                    })

                    //Update production dengan id_kadar_upah

                    var detailUpah = await KadarUpahModel.findOne({
                        where : {id_kadar_upah : kadarUpah.id_kadar_upah},
                        include : [
                            {
                                model : KodKeduaModel,
                                as : 'JenisKerja',
                                required : true,
                                attributes: ['kod_ref','keterangan']     
                            },    
                        ]
                    })


                    var conditionProd = {}

                            
                    switch(detailUpah.JenisKerja.kod_ref) {
                        case "PTG":
                            conditionProd["id_tukang_potong"] = detailUpah.id_tukang; 
                            conditionProd["status_potong"] = statusSelesaiProd; 
                            conditionProd["id_kontrak"] = detailUpah.id_kontrak; 

                            break;
                        case "JHT":             
                            conditionProd["id_tukang_jahit"] = detailUpah.id_tukang; 
                            conditionProd["status_jahit"] = statusSelesaiProd; 
                        break;
                        case "BTG":
                            conditionProd["id_tukang_butang"] = detailUpah.id_tukang; 
                            conditionProd["status_butang"] = statusSelesaiProd; 
                            break;
                        case "SLM":
                            conditionProd["id_tukang_sulam"] = detailUpah.id_tukang; 
                            conditionProd["status_sulam"] = statusSelesaiProd;                         
                    }                    
                                
                    var existProd = await TempahanProductionModel.findOne({

                    })

                }

                await KadarUpahInvoiceModel.bulkCreate(arrayInvoice, {
                    transaction : transaction
                });  

            }

            await transaction.commit();

            return res.status(200).send({ "message" : "Berjaya create invoice." });

        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getListInvoice(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;

            var invoiceList = await KadarUpahInvoiceModel.findAndCountAll({
                where : Helper.filterJoin(req, [
                    {
                        model : KadarUpahModel,
                        columnsLike : [
                            'nama',
                        ],
                        columnsEqual : ['id_pengguna'],
                        joinAlias : 'KadarUpah'
                    },
                ], true),
                subQuery: false, 
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_kadar_upah', 'DESC']],
                include : [
                    {
                        model : KadarUpahModel,
                        as : 'KadarUpah',
                        required : true,
                        include : [
                            {                                
                                model : KontrakModel,
                                as : 'Kontrak',
                                required : true,
                                attributes: ['id_kontrak','kod_kontrak','tajuk_ringkas']                   
                            },
                            {                                
                                model : PenggunaModel,
                                as : 'Tukang',
                                required : true,
                                attributes: ['nama']                   
                            },                    
                            {
                                model : KodKeduaModel,
                                as : 'JenisKerja',
                                required : true,
                                attributes: ['kod_ref','keterangan']     
                            },                    
                        ]
                    },
                    {                                
                        model : PenggunaModel,
                        as : 'Staf',
                        required : true,
                        attributes: ['nama']                   
                    }, 
  
                ]

            });
                            
            if (!invoiceList){
                return res.status(404).send({'message': 'List tidak dijumpai'});
            }

            return res.status(200).send({
                'totalSize' : invoiceList.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : invoiceList.rows,
            });


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },


    async getDetailInvoice(req, res) {
        try {


            var invoiceDetail = await KadarUpahInvoiceModel.findOne({
                where : { id_kadar_upah_invoice : req.params.id },
                subQuery: false, 
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                include : [
                    {
                        model : KadarUpahModel,
                        as : 'KadarUpah',
                        required : true,
                        include : [
                            {                                
                                model : KontrakModel,
                                as : 'Kontrak',
                                required : true,
                                attributes: ['id_kontrak','kod_kontrak','tajuk_ringkas']                   
                            },
                            {                                
                                model : PenggunaModel,
                                as : 'Tukang',
                                required : true,
                                attributes: ['nama']                   
                            },                    
                            {
                                model : KodKeduaModel,
                                as : 'JenisKerja',
                                required : true,
                                attributes: ['kod_ref','keterangan']     
                            },                    
                        ]
                    },
                    {                                
                        model : PenggunaModel,
                        as : 'Staf',
                        required : true,
                        attributes: ['nama']                   
                    }, 
  
                ]

            });
                            
            if (!invoiceDetail){
                return res.status(404).send({'message': 'List tidak dijumpai'});
            }

            return res.status(200).send(invoiceDetail);


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

}

module.exports = KadarUpah;