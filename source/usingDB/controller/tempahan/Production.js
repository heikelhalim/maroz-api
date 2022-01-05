const KontrakModel = require("../../models/sequelize/Kontrak");
const KontrakTukangJahitModel = require("../../models/sequelize/KontrakTukangJahit");
const TempahanPemakaiModel = require("../../models/sequelize/TempahanPemakai");
const TempahanUkuranModel = require("../../models/sequelize/TempahanUkuran");
const SyarikatModel = require("../../models/sequelize/Syarikat");
const KodKeduaModel = require("../../models/sequelize/KodKedua");
const PenggunaModel = require("../../models/sequelize/User")

const DesignPakaianModel = require("../../models/sequelize/DesignPakaian");
const TempahanProductionModel = require("../../models/sequelize/TempahanProduction");
const KadarUpahModel = require("../../models/sequelize/KadarUpah");
const KadarUpahInvoiceModel = require("../../models/sequelize/KadarUpahInvoice");

const barcode = require('barcode');
const JsBarcode = require('jsbarcode');
const pdf = require('html-pdf');
const { createCanvas } = require("canvas");
const path = require('path');
const mime = require('mime');
const fs = require('fs');  
const sequelize = require("sequelize");

const Helper = require("../../controller/Helper");
const moment = require("moment");
const TempahanProduction = require("../../models/define/TempahanProduction");

const Production = {

    async senaraiProduction (req,res) {
        try {

            const pageSize = req.body.sizePerPage || 100;
            const page = req.body.page || 1;


            var flowProduction = req.body.flowProduction; // potong,jahit,sulam,butang,qc,packing
            var statusProduction = req.body.statusProduction; //belumagih,pendingagih,proses,selesai

            var filterFlow = {};
            var aliasStatus = "";
            var aliasTukang = "";

            if (flowProduction == "potong")
            {
                aliasStatus = "StatusPotong";
                aliasTukang = "TukangPotong";
                filterFlow["is_potong"] = true;
            }
            else if (flowProduction == "jahit")
            {
                aliasStatus = "StatusJahit";
                aliasTukang = "TukangJahit";
                filterFlow["is_jahit"] = true;
            }
            else if (flowProduction == "sulam")
            {
                aliasStatus = "StatusSulam";
                aliasTukang = "TukangSulam";
                filterFlow["is_sulam"] = true;
            }
            else if (flowProduction == "butang")
            {
                aliasStatus = "StatusButang";
                aliasTukang = "TukangButang";
                filterFlow["is_butang"] = true;
            }
            else if (flowProduction == "qc")
            {
                aliasStatus = "StatusQC";
                aliasTukang = "TukangQC";
                filterFlow["is_qc"] = true;
            }
            else if (flowProduction == "packaging")
            {
                aliasStatus = "StatusPackaging";
                aliasTukang = "TukangPackaging";
                filterFlow["is_packaging"] = true;
            }


            const kod_status = ["belumagih","pendingagih","proses","selesai"];

            var kod_kedua = {
                belumagih : "BEA",
                pendingagih : "PEA",
                proses : "PRS",
                selesai : "SLS"
            };

            var kod_status_kod = "";
            var arr_status_cnt = [];
            

            for (var item of kod_status){  
                var status_count = {};
                switch(item) {
                    case "selesai":
                        kod_status_kod = kod_kedua.selesai; //hantar
                        break;
                    case "proses":             
                        kod_status_kod = kod_kedua.proses; // selesai
                        break;
                    case "pendingagih":
                        kod_status_kod = kod_kedua.pendingagih; // draft
                        break;
                    default:
                        kod_status_kod = kod_kedua.belumagih; // Baru dan Auto Lulus - Pending Penyemak
                }

                const showStatus = await TempahanProductionModel.count({
                    include: [
                        {
                            model : KodKeduaModel,
                            as : aliasStatus,
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
       
            
            switch(statusProduction) {        
                case "selesai":
                    kod = kod_kedua.selesai; //hantar
                    break;
                case "proses":             
                    kod = kod_kedua.proses; // selesai
                    break;
                case "pendingagih":
                    kod = kod_kedua.pendingagih; // draft
                    break;
                default:
                    kod = kod_kedua.belumagih; // Baru dan Auto Lulus - Pending Penyemak
            }
            
            condition = {
                'kod_ref' : kod ,
                'is_aktif' : true
            };



            var listProduction = await TempahanProductionModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),   
                where : filterFlow,
                include : [
                    {
                        model : KodKeduaModel,
                        as : aliasStatus,
                        required : true,
                        where : condition,
                        attributes: ['kod_ref','keterangan'] 
                    },
                    {
                        model : PenggunaModel,
                        as : aliasTukang,
                        attributes: ['id_pengguna','nama','nama_pengguna'] 
                    },
                    {
                        model : TempahanUkuranModel,
                        as : "TempahanUkuran",
                        required : true,
                        attributes: ["id_pemakai_tempahan","id_dsgn_pakaian","id_jenis_pakaian","kod_tempahan"],
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
                                        attributes : ["kod_kontrak",]               
                                    }                                   
                               ]
                            },
                            {
                                model : DesignPakaianModel,
                                as : 'DesignPakaian',
                                attributes: ["kod_design"],
                                include : [
                                    {                                
                                        model : KodKeduaModel,
                                        as : 'JenisPakaian',
                                        attributes: ['kod_ref','keterangan']                   
                                    },
                                ]
                            }                               
                        ]
                    }

                ],
                order : [['barcode', 'DESC']],

            });

            return res.status(200).send({
                'status_list' : arr_status_cnt,
                'totalSize' : listProduction.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : listProduction.rows,
            });


        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getStatusCountProduction (req,res) {
        try {


            var flowProduction = req.params.status; // potong,jahit,sulam,butang,qc,packing

            var aliasStatus = "";

            if (flowProduction == "potong")
            {
                aliasStatus = "StatusPotong";
            }
            else if (flowProduction == "jahit")
            {
                aliasStatus = "StatusJahit";
            }
            else if (flowProduction == "sulam")
            {
                aliasStatus = "StatusSulam";
            }
            else if (flowProduction == "butang")
            {
                aliasStatus = "StatusButang";
            }
            else if (flowProduction == "qc")
            {
                aliasStatus = "StatusQC";
            }
            else if (flowProduction == "packaging")
            {
                aliasStatus = "StatusPackaging";
            }


            const kod_status = ["belumagih","pendingagih","proses","selesai"];

            var kod_kedua = {
                belumagih : "BEA",
                pendingagih : "PEA",
                proses : "PRS",
                selesai : "SLS"
            };

            var kod_status_kod = "";
            var arr_status_cnt = [];
            

            for (var item of kod_status){  
                var status_count = {};
                switch(item) {
                    case "selesai":
                        kod_status_kod = kod_kedua.selesai; //hantar
                        break;
                    case "proses":             
                        kod_status_kod = kod_kedua.proses; // selesai
                        break;
                    case "pendingagih":
                        kod_status_kod = kod_kedua.pendingagih; // draft
                        break;
                    default:
                        kod_status_kod = kod_kedua.belumagih; // Baru dan Auto Lulus - Pending Penyemak
                }

                const showStatus = await TempahanProductionModel.count({
                    include: [
                        {
                            model : KodKeduaModel,
                            as : aliasStatus,
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

            
            return res.status(200).send(arr_status_cnt);
        } catch (error) {
            console.log(error)
            return res.status(400).send(error);
        }
    },

    async getDetailTempahanPemakai (req,res){
        try {

            var modelUkuran = {
                model : TempahanUkuranModel,
                as : "TempahanUkuran",
                required : true,
                attributes: ["id_tempahan_ukuran","id_pemakai_tempahan","id_dsgn_pakaian","id_jenis_pakaian","bilangan","kod_tempahan"],
                include : [
                    {
                        model : TempahanPemakaiModel,
                        as : "Pemakai",
                        required : true,
                        where : { id_pemakai_tempahan : req.params.id },
                        attributes: { 
                            exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                       },
                       include : [
                            {
                                model : KontrakModel,
                                as : "Kontrak",
                                required : true, 
                                attributes : ["kod_kontrak",]               
                            }                                   
                        ]
                    },
                    {
                        model : DesignPakaianModel,
                        as : 'DesignPakaian',
                        attributes: ["kod_design"],
                        include : [
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisPakaian',
                                attributes: ['kod_ref','keterangan']                   
                            },
                        ]
                    }                                  
                ]
            }

            if (req.body.id_tempahan_ukuran)
            {
                modelUkuran["where"]= { id_tempahan_ukuran : req.body.id_tempahan_ukuran }
            }


            var detailProd = await TempahanProductionModel.findAll({    
                attributes: { 
                    exclude: ['created_at','created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by','createdAt','updatedAt','deletedAt']
                },                            
                include : [
                    {
                        model : KodKeduaModel,
                        as : "StatusPotong",
                        attributes: ['kod_ref','keterangan'] 
                    },
                    {
                        model : KodKeduaModel,
                        as : "StatusJahit",
                        attributes: ['kod_ref','keterangan'] 
                    },
                    {
                        model : KodKeduaModel,
                        as : "StatusButang",
                        attributes: ['kod_ref','keterangan'] 
                    },
                    {
                        model : KodKeduaModel,
                        as : "StatusQC",
                        attributes: ['kod_ref','keterangan'] 
                    },
                    {
                        model : KodKeduaModel,
                        as : "StatusSulam",
                        attributes: ['kod_ref','keterangan'] 
                    },
                    {
                        model : KodKeduaModel,
                        as : "StatusPackaging",
                        attributes: ['kod_ref','keterangan'] 
                    },
                    {
                        model : PenggunaModel,
                        as : "TukangPotong",
                        attributes: ['id_pengguna','nama','nama_pengguna'] 
                    },
                    {
                        model : PenggunaModel,
                        as : "TukangJahit",
                        attributes: ['id_pengguna','nama','nama_pengguna'] 
                    },
                    {
                        model : PenggunaModel,
                        as : "TukangButang",
                        attributes: ['id_pengguna','nama','nama_pengguna'] 
                    },
                    {
                        model : PenggunaModel,
                        as : "TukangSulam",
                        attributes: ['id_pengguna','nama','nama_pengguna'] 
                    },
                    {
                        model : PenggunaModel,
                        as : "TukangQC",
                        attributes: ['id_pengguna','nama','nama_pengguna'] 
                    },
                    {
                        model : PenggunaModel,
                        as : "TukangPackaging",
                        attributes: ['id_pengguna','nama','nama_pengguna'] 
                    },
                    modelUkuran
                ]            
            });

            return res.status(200).send(detailProd);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async assignTukang (req,res) {
        try {

            if (req.body.idTukang)
            {
                const transaction = await TempahanProductionModel.sequelize.transaction();

                const flowProduction = req.body.flowProduction;

                var data= {}                    
                
                const idStatusPendingAgih = await Helper.getIdKodKedua("PEA", 'ref_status_production')


                if (flowProduction == "potong")
                {
                    data["id_tukang_potong"] = req.body.idTukang;
                    data["status_potong"] = idStatusPendingAgih;
                }
                else if (flowProduction == "jahit")
                {
                    data["id_tukang_jahit"] = req.body.idTukang;
                    data["status_jahit"] = idStatusPendingAgih;

                }
                else if (flowProduction == "sulam")
                {
                    data["id_tukang_sulam"] = req.body.idTukang;
                    data["status_sulam"] = idStatusPendingAgih;
                    data["is_lock"] = true;

                }
                else if (flowProduction == "butang")
                {
                    data["id_tukang_butang"] = req.body.idTukang;
                    data["status_butang"] = idStatusPendingAgih;
                    data["is_lock"] = true;

                }
                else if (flowProduction == "qc")
                {
                    data["id_tukang_qc"] = req.body.idTukang;
                    data["status_qc"] = idStatusPendingAgih;
                    data["is_lock"] = true;

                }
                else if (flowProduction == "packaging")
                {
                    data["id_tukang_packaging"] = req.body.idTukang;
                    data["status_packaging"] = idStatusPendingAgih;

                }
    
                const arrayTempahan = req.body.idTempahanProduction;
    
                if (arrayTempahan.length>0)
                {
                    //if ada item array
    
                    await TempahanProductionModel.update(data,{
                        where : { id_tempahan_production : arrayTempahan },
                        transaction : transaction
                    })
    
                    await transaction.commit();
                }
                 
            }
            
            return res.status(200).send({ "message" : "Success Assign" });

        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async revertPendingToBelumAgih (req,res) {
        try {
 
  
            const transaction = await TempahanProductionModel.sequelize.transaction();

            const flowProduction = req.body.flowProduction;

            var data= {}                    
            
            const idStatusPendingAgih = await Helper.getIdKodKedua("BEA", 'ref_status_production') //Belum Agih


            if (flowProduction == "potong")
            {
                data["id_tukang_potong"] = null;
                data["status_potong"] = idStatusPendingAgih;
            }
            else if (flowProduction == "jahit")
            {
                data["id_tukang_jahit"] = null;
                data["status_jahit"] = idStatusPendingAgih;

            }
            else if (flowProduction == "sulam")
            {
                data["id_tukang_sulam"] = null;
                data["status_sulam"] = idStatusPendingAgih;
                data["is_lock"] = false;


            }
            else if (flowProduction == "butang")
            {
                data["id_tukang_butang"] = null;
                data["status_butang"] = idStatusPendingAgih;
                data["is_lock"] = false;

            }
            else if (flowProduction == "qc")
            {
                data["id_tukang_qc"] = null;
                data["status_qc"] = idStatusPendingAgih;
                data["is_lock"] = false;


            }
            else if (flowProduction == "packaging")
            {
                data["id_tukang_packaging"] = null;
                data["status_packaging"] = idStatusPendingAgih;

            }

            const arrayTempahan = req.body.idTempahanProduction;

            if (arrayTempahan.length>0)
            {
                //if ada item array

                await TempahanProductionModel.update(data,{
                    where : { id_tempahan_production : arrayTempahan },
                    transaction : transaction
                })

                await transaction.commit();
            }
                
         
            return res.status(200).send({ "message" : "Success Assign" });

        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },    

    async assignPendingToProses (req,res) {
        try {

            const transaction = await TempahanProductionModel.sequelize.transaction();

            const flowProduction = req.body.flowProduction;

            var data= {}                    
            
            const idStatusProses = await Helper.getIdKodKedua("PRS", 'ref_status_production') 



            if (flowProduction == "potong")
            {
                data["status_potong"] = idStatusProses;
                data["tarikh_mula_potong"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
            }
            else if (flowProduction == "jahit")
            {
                data["status_jahit"] = idStatusProses;
                data["tarikh_mula_jahit"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');            
            }
            else if (flowProduction == "sulam")
            {
                data["status_sulam"] = idStatusProses;
                data["tarikh_mula_sulam"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');                
            }
            else if (flowProduction == "butang")
            {
                data["status_butang"] = idStatusProses;
                data["tarikh_mula_butang"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');                
            }
            else if (flowProduction == "qc")
            {
                data["status_qc"] = idStatusProses;
                data["tarikh_mula_qc"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');

            }
            else if (flowProduction == "packaging")
            {
                data["status_packaging"] = idStatusProses;
                data["tarikh_mula_packaging"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');

            }

            const arrayTempahan = req.body.idTempahanProduction;

            if (arrayTempahan.length>0)
            {
                //if ada item array

                await TempahanProductionModel.update(data,{
                    where : { id_tempahan_production : arrayTempahan },
                    transaction : transaction
                })
       
                await transaction.commit();

            }
                 
            
            return res.status(200).send({ "message" : "Success Assign" });

        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

            
    async cetakBarcode (req,res) {
        try {
            


            // var arrayBarcode = ["0000000000000","0000000000001","0000000000002",
            // "0000000000003","0000000000004","0000000000005",
            // "0000000000006","0000000000007","0000000000008",
            // "0000000000009","0000000000010","0000000000011"]


            var arrayBarcode = req.body.arrayBarcode;

            //loop
            var maxline = 3;
            var count = 0;
            var stringBc = "";




            //Read template

            var dir = process.env.DOCUMENTS+'barcode/';
            var random = Helper.random();
            var fileName = 'print_barcode'+random+'.pdf';
            var filePath = dir+fileName; 

            var html = fs.readFileSync(path.resolve(process.env.ROOT_URL, 'template/barcode/barcode.html'), 'utf8');

            var canvas = createCanvas(); 
            
            var htmlfrag = "";
            var format = "";
            
            for (var item of arrayBarcode)
            {
                JsBarcode(canvas, item); 

                // stringBc += item+"  " ;

                format = '<img src="' + canvas.toDataURL() + '" /><br>';


                htmlfrag += format;
                
                // count++;


                // if (count==maxline)
                // {
                //     console.log(stringBc);
                //     stringBc = "";
                //     count = 0;
                // }
                
            }            


            // JsBarcode(canvas, "Hello"); 
            // canvas = createCanvas();
            // JsBarcode(canvas, "OHAYO"); 
            html = html.replace('{barcode_data}', "Maroz Tailoring Barcode");

            html = html.replace('{barcode_image}', htmlfrag);


            function downloadPdf() {
                return new Promise((resolve, reject) => {
                    return pdf.create(html,options).toStream(function (err, stream) {
                        if (err) return res.send(err);
                        res.type('pdf');
                        stream.pipe(res);

                        // stream.pipe(fs.createWriteStream('./foo.pdf'));                        
                    });
                }); 
            } 
            // var genPdf = await generatePdf(html, options, filePath);
            var options = { format: 'Letter' };

            await downloadPdf(html, options, filePath);




        


        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async cetakDesign (req,res) {
        try {
            
            var dir = process.env.DOCUMENTS+'barcode/';
            var random = Helper.random();
            var fileName = 'print_barcode'+random+'.pdf';
            var filePath = dir+fileName; 

            var html = fs.readFileSync(path.resolve(process.env.ROOT_URL, 'template/ukuran.html'), 'utf8');

            //get image
            var base64str = Production.base64_encode('test.jpg');






            var count = 3

            var gambar = "";
            var htmlfrag = "";
            for (var i = 0; i<count; i++)
            {

                gambar = '<img src="' + base64str + '"  width="500" height="400"/><br> <p style="page-break-before: always"> ';
               

                htmlfrag += gambar;
                

            }





            html = html.replace('{image}', htmlfrag);

            var options = { 
                format: 'Letter' ,
                type: "pdf"
            };

            function downloadPdf() {
                return new Promise((resolve, reject) => {
                    return pdf.create(html,options).toStream(function (err, stream) {
                        if (err) return res.send(err);
                        res.type('pdf');
                        stream.pipe(res);

                        // stream.pipe(fs.createWriteStream('./foo.pdf'));                        
                    });
                }); 
            } 

            await downloadPdf(html, options, filePath);

        } catch (error) {
            console.log(error)
            return res.status(400).send(error);
        }
    },

    async cetakSenaraiUkuranMengikutTukang(req,res){
        try {

                /*
                    Senarai Tempahan
                    Nama Tukang
                    Tarikh Cetak
                    List Senarai Tempahan (Barcode)
                    Lampiran Ukuran Dan Design
                */  

                const body = req.body;
                var attributeTukang = "";
                var aliasProduction = "";
                var filterProduction  = {};

                var statusProductionProses = await Helper.getIdKodKedua("PRS","ref_status_production");

                switch(body.flowProduction) {
                    case "potong":
                        attributeTukang = "id_tukang_potong"
                        aliasProduction = "SenaraiPotong"
                        filterProduction["status_potong"] = statusProductionProses
                        break;
                    case "jahit":             
                        attributeTukang = "id_tukang_jahit"
                        aliasProduction = "SenaraiJahit"
                        filterProduction["status_jahit"] = statusProductionProses
                        break;
                    case "butang":
                        attributeTukang = "id_tukang_butang"
                        aliasProduction = "SenaraiButang"
                        filterProduction["status_butang"] = statusProductionProses
                        break;
                    case "sulam":
                        attributeTukang = "id_tukang_sulam"
                        aliasProduction = "SenaraiSulam"
                        filterProduction["status_sulam"] = statusProductionProses
                        break;                    
                    case "qc":
                        attributeTukang = "id_tukang_qc"
                        aliasProduction = "SenaraiQC"
                        filterProduction["status_qc"] = statusProductionProses
                        break;    
                    case "packaging":
                        attributeTukang = "id_tukang_packaging"
                        aliasProduction = "SenaraiPackaging"
                        filterProduction["status_packaging"] = statusProductionProses
                    break;    
                }       

                //get distinct list tukang 
                // const listtukang = await TempahanProductionModel.findAll({
                //     attributes: [
                //     [attributeTukang,"id_tukang"]
                //     ],
                //     where : {"id_tempahan_production" : body.arrayTempahan},
                //     group: [attributeTukang]
                // });

                var listTempahanTukang;

                var listtukang = req.body.arrayIdTukang

                //check ada tukang tak
                if (listtukang.length>0)
                {
                    // var arrayIdTukang = []
                    // for (var tukang of listtukang)
                    // {
                    //     arrayIdTukang.push(tukang.dataValues.id_tukang);
                    // }

                    listTempahanTukang = await PenggunaModel.findAll({
                        where : { id_pengguna : listtukang },
                        attributes : ["id_pengguna","nama"],
                        include: [
                            {
                                model : TempahanProductionModel,
                                as : aliasProduction,
                                where : filterProduction,
                                attributes : ["id_tempahan_ukuran","barcode"],
                                include : [
                                    {
                                        model : TempahanUkuranModel,
                                        as : "TempahanUkuran",
                                        required : true,
                                        attributes: ["id_pemakai_tempahan","id_dsgn_pakaian","id_jenis_pakaian","kod_tempahan"],
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
                                                        attributes : ["kod_kontrak",]               
                                                    }                                   
                                               ]
                                            },
                                            {
                                                model : DesignPakaianModel,
                                                as : 'DesignPakaian',
                                                attributes: ["kod_design"],
                                                include : [
                                                    {                                
                                                        model : KodKeduaModel,
                                                        as : 'JenisPakaian',
                                                        attributes: ['kod_ref','keterangan']                   
                                                    },
                                                ]
                                            }                               
                                        ]
                                    }
                
                                ]
                            },
                        ]
    
                    })

                    //mapping  tempahan ukuran
                    var  modifiedList = [] 

                    for (var detailTempahan of listTempahanTukang)
                    {
                        var arrayIdTempahanUkuran = []
 

                        for (var tempahan of detailTempahan.SenaraiPotong)
                        {
                            arrayIdTempahanUkuran.push(tempahan.id_tempahan_ukuran)
                        }

                        //distinct id_tempahan_ukuran in array
                        var uniqueID = [...new Set(arrayIdTempahanUkuran)]

                        var listUkuran = await TempahanUkuranModel.findAll({
                            where : { id_tempahan_ukuran : uniqueID },
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
                                            attributes : ["id_kontrak","kod_kontrak"],
                                            include : [
                                                {                                
                                                    model : SyarikatModel,
                                                    as : 'Syarikat',
                                                    attributes: ['nama_syarikat','kod_syarikat']                    
                                                }
                                            ]               
                                        }                                                       
                                    ]
                                    
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
                        })
 
                        detailTempahan.dataValues.DesignUkuran = listUkuran

                        modifiedList.push(detailTempahan)

                    }

                    listTempahanTukang = modifiedList
 

                    //html mapping per tukang

                    var htmltukang = "";

                    for (var detailTukang of listTempahanTukang)
                    {
                        var html = fs.readFileSync(path.resolve(process.env.ROOT_URL, 'template/ukuranDesign/sub_ukuran_list.html'), 'utf8');

                        html = html.replace('{namaTukang}', detailTukang.nama.toUpperCase());
                        html = html.replace('{jenisKerja}', "KERJA "+ body.flowProduction.toUpperCase());
                        html = html.replace('{tarikhMulaPotong}', "13/12/2021");

     
 
                        var senaraiTempahan = detailTukang.SenaraiPotong
                        var senaraiUkuran = detailTukang.dataValues.DesignUkuran

                        //List Tempahan
                        var listTempahanProd = ""                        
                        for (var listTempahan of senaraiTempahan)
                        {
  
                            listTempahanProd += "<tr>"
                            listTempahanProd += "<td>"+listTempahan.barcode+"</td>"
                            listTempahanProd += "<td>"+listTempahan.TempahanUkuran.kod_tempahan+"</td>"
                            listTempahanProd += "<td>"+listTempahan.TempahanUkuran.Pemakai.nama+"</td>"
                            listTempahanProd += "<td>"+listTempahan.TempahanUkuran.Pemakai.Kontrak.kod_kontrak+"</td>"
                            listTempahanProd += "<td>"+listTempahan.TempahanUkuran.DesignPakaian.kod_design+"</td>"
                            // listTempahanProd += "<td>"+listTempahan.TempahanUkuran.DesignPakaian.JenisPakaian.keterangan+"</td>"
                            listTempahanProd += "</tr>"
 
                        }
  
                        //Lampiran Ukuran
                        var str_lampiran = ""

                        for (var lampiran of senaraiUkuran )
                        {
      
                            var htmllampiran = fs.readFileSync(path.resolve(process.env.ROOT_URL, 'template/ukuranDesign/sub_ukuran_lampiran.html'), 'utf8');
                            var base64str = Production.base64_encode('test.jpg');  

                            htmllampiran = htmllampiran.replace('{nama_tukang}', detailTukang.nama.toUpperCase());                            
                            htmllampiran = htmllampiran.replace('{jenis_kerja}',"KERJA "+ body.flowProduction.toUpperCase());                            
                            htmllampiran = htmllampiran.replace('{image}', base64str);                            
                            htmllampiran = htmllampiran.replace('{kod_kontrak}', lampiran.Pemakai.Kontrak.kod_kontrak);                            
                            htmllampiran = htmllampiran.replace('{kod_tempahan}', lampiran.kod_tempahan);
                            htmllampiran = htmllampiran.replace('{nama_pemakai}', lampiran.Pemakai.nama);
                            htmllampiran = htmllampiran.replace('{bilangan}', lampiran.bilangan);
                            htmllampiran = htmllampiran.replace('{kod_design}', lampiran.DesignPakaian.kod_design);
                            htmllampiran = htmllampiran.replace('{nota}', lampiran.nota);

                            str_lampiran += htmllampiran
                            
                        }


                        html = html.replace('{listTempahanProd}', listTempahanProd);

                        html = html.replace('{lampiran_sub}', str_lampiran);

                        htmltukang += html

                    }


                    var htmlMainUkuran = fs.readFileSync(path.resolve(process.env.ROOT_URL, 'template/ukuranDesign/main_ukuran.html'), 'utf8');
                    htmlMainUkuran = htmlMainUkuran.replace('{template}', htmltukang);

 
                    var options = { 
                        format: 'Letter' , 
                        type: "pdf",
                    };
        
                    function downloadPdf() {
                        return new Promise((resolve, reject) => {
                            return pdf.create(htmlMainUkuran).toStream(function (err, stream) {
                                if (err) return res.send(err);
                                res.type('pdf');
                                stream.pipe(res);               
                            });
                        });  
                    } 
        
                    return res.status(200).send(htmlMainUkuran);

                    await downloadPdf(htmlMainUkuran, options);
                }

                return res.status(200).send(listTempahanTukang);
            
        } catch (error) {
            console.log(error)
            return res.status(400).send(error);
        }
    },

    async getListTukangAssign (req, res){
        try {

            var attributeTukang = ""
            var filterProduction = {}
            var statusProductionProses = await Helper.getIdKodKedua("PRS","ref_status_production");

            switch(req.params.flow) {
                case "potong":
                    attributeTukang = "id_tukang_potong"
                    filterProduction["status_potong"] = statusProductionProses
                    break;
                case "jahit":             
                    attributeTukang = "id_tukang_jahit"
                    filterProduction["status_jahit"] = statusProductionProses
                    break;
                case "butang":
                    attributeTukang = "id_tukang_butang"
                    filterProduction["status_butang"] = statusProductionProses
                    break;
                case "sulam":
                    attributeTukang = "id_tukang_sulam"
                    filterProduction["status_sulam"] = statusProductionProses
                    break;                    
                case "qc":
                    attributeTukang = "id_tukang_qc"
                    filterProduction["status_qc"] = statusProductionProses
                    break;    
                case "packaging":
                    attributeTukang = "id_tukang_packaging"
                    filterProduction["status_packaging"] = statusProductionProses
                break;    
            }     


            //get distinct list tukang 
            const listtukang = await TempahanProductionModel.findAll({
                attributes: [
                [attributeTukang,"id_tukang"]
                ],
                where : filterProduction,
                group: [attributeTukang]
            });

            var arraytukang = []
            for (var tukang of listtukang)
            {
                arraytukang.push(tukang.dataValues.id_tukang)
                
            }


            var listTempahanTukang = await PenggunaModel.findAll({
                where : { id_pengguna : arraytukang },
                attributes : ["id_pengguna","nama"]
            })


            
            res.status(200).send(listTempahanTukang);
        } catch (error) {
            console.log(error)
            return res.status(400).send(error);
        }
    },

    async barcodeScanSelesaiProses (req,res) {
        try {
            const transaction = await TempahanProductionModel.sequelize.transaction();

            var flowProduction = req.body.flowProduction; // potong,jahit,sulam,butang,qc,packing
            var statusSelesai = await Helper.getIdKodKedua("SLS", 'ref_status_production')
            var statusBelumAgih = await Helper.getIdKodKedua("BEA", 'ref_status_production')

            var filter = {};

            //pass value barcode
            filter["barcode"] = req.body.barcode; 

            var jenisProduction = "";

            if (flowProduction == "potong")
            {
                filter["status_potong"] = statusSelesai;                
                jenisProduction = await Helper.getIdKodKedua("PTG", 'ref_jenis_production') 

            }
            else if (flowProduction == "jahit")
            {  
                filter["status_jahit"] = statusSelesai;
                jenisProduction = await Helper.getIdKodKedua("JHT", 'ref_jenis_production')                 
            }
            else if (flowProduction == "sulam")
            {
                filter["status_sulam"] = statusSelesai;
                jenisProduction = await Helper.getIdKodKedua("SLM", 'ref_jenis_production') 
            }
            else if (flowProduction == "butang")
            {
                filter["status_butang"] = statusSelesai;          
                jenisProduction = await Helper.getIdKodKedua("BTG", 'ref_jenis_production')                
            }
            else if (flowProduction == "qc")
            {
                filter["status_qc"] = statusSelesai;              
            }
            else if (flowProduction == "packaging")
            {
                filter["status_packaging"] = statusSelesai;
 
            }

            var checkStatusDetailProd = await TempahanProductionModel.findOne({
                where : filter            
            });

            //check data ni dah scan terima ke belum
            if (checkStatusDetailProd)
            {
                return res.status(200).send({"message" : "Tempahan ini sudah scan Selesai"});
            }
            else
            {                
                //Update status selesai

                var data = {};
                var detailProd = await TempahanProductionModel.findOne({
                    where : { barcode : req.body.barcode },
                    include : [
                        {
                            model : KodKeduaModel,
                            as : "StatusPotong",
                            attributes: ['kod_ref','keterangan'] 
                        },
                        {
                            model : KodKeduaModel,
                            as : "StatusJahit",
                            attributes: ['kod_ref','keterangan'] 
                        },
                        {
                            model : KodKeduaModel,
                            as : "StatusButang",
                            attributes: ['kod_ref','keterangan'] 
                        },
                        {
                            model : KodKeduaModel,
                            as : "StatusQC",
                            attributes: ['kod_ref','keterangan'] 
                        },
                        {
                            model : KodKeduaModel,
                            as : "StatusSulam",
                            attributes: ['kod_ref','keterangan'] 
                        },
                        {
                            model : KodKeduaModel,
                            as : "StatusPackaging",
                            attributes: ['kod_ref','keterangan'] 
                        },
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
                                            attributes : ["id_kontrak"]               
                                        }                                   
                                    ]
                                }                                
                            ]
                        }                        

                    ]            
                });


                if (flowProduction == "potong")
                {
                    data["status_potong"] = statusSelesai;
                    data["status_jahit"] = statusBelumAgih;
                    data["tarikh_akhir_potong"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
                }
                else if (flowProduction == "jahit")
                {
                    data["status_jahit"] = statusSelesai;
                    data["tarikh_akhir_jahit"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
 
                    //check prod perlu lalu flow ke
                    if (detailProd.is_sulam == false && detailProd.is_butang == false && detailProd.is_qc == false)
                    {
                        //Proceed to packaging 
                        data["status_packaging"] = statusBelumAgih;
                    }
                    else
                    {
                        //check butang, sulam and qc

                        if (detailProd.is_sulam == true)
                        {
                            data["status_sulam"] = statusBelumAgih;
                        }

                        if (detailProd.is_butang == true)
                        {
                            data["status_butang"] = statusBelumAgih; 
                        }

                        if (detailProd.is_qc == true)
                        {
                            data["status_qc"] = statusBelumAgih; 
                        }

                    }


                }
                else if (flowProduction == "sulam")
                {
                    data["status_sulam"] = statusSelesai;
                    data["tarikh_akhir_sulam"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
                    data["is_lock"] = false;


                    var isSelesai= Production.checkButangSulamQc("sulam",detailProd);
    
                    //jika semua flow selesai, hantar ke packing
                    if (isSelesai)
                    {
                        data["status_packaging"] = statusBelumAgih;
                    }


                }
                else if (flowProduction == "butang")
                {
                    data["status_butang"] = statusSelesai;
                    data["tarikh_akhir_butang"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');      
                    data["is_lock"] = false;

                    var isSelesai= Production.checkButangSulamQc("butang",detailProd);
                    //jika semua flow selesai, hantar ke packing

                    if (isSelesai)
                    {
                        data["status_packaging"] = statusBelumAgih;
                    }
                    
    
                }
                else if (flowProduction == "qc")
                {
    
                    data["status_qc"] = statusSelesai;
                    data["tarikh_akhir_qc"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');  
                    data["is_lock"] = false;

                    var isSelesai= Production.checkButangSulamQc("qc",detailProd);
                    //jika semua flow selesai, hantar ke packing
                    if (isSelesai)
                    {
                        data["status_packaging"] = statusBelumAgih;
                    }
                    
                }
                else if (flowProduction == "packaging")
                {
                    data["status_packaging"] = statusSelesai;
                    data["tarikh_akhir_packaging"] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');                    
                }
    

                //Kiraan upah tukang
                if (flowProduction == "potong" || flowProduction == "jahit" || flowProduction == "butang" || flowProduction == "sulam"){
                
                    console.log("test");

                    var idTukang = "";

                    switch(flowProduction) {
                        case "potong":
                            idTukang = detailProd.id_tukang_potong
                            break;
                        case "jahit":             
                            idTukang = detailProd.id_tukang_jahit
                            break;
                        case "butang":
                            idTukang = detailProd.id_tukang_butang
                            break;
                        case "sulam":
                            idTukang = detailProd.id_tukang_sulam
                    }                    


                    //check kadar upah per kontrak dah create ke belum
                    var dataKadar = {
                        "id_kontrak" : detailProd.TempahanUkuran.Pemakai.Kontrak.id_kontrak,
                        "id_jenis_kerja" : jenisProduction,
                        "id_tukang" : idTukang,
                        "id_status" : await Helper.getIdKodKedua("DRF","ref_status_kiraan_upah")
                    }

                    var existKadarUpah = await KadarUpahModel.findAll({
                        where : dataKadar,
                        // include  : [
                        //     {                                
                        //         model : PenggunaModel,
                        //         as : 'Staf',
                        //         required : true,
                        //         attributes: ['nama']                   
                        //     }
                        // ]
                    });

                    // console.log(existKadarUpah);

                
                    if (existKadarUpah.length<0)
                    {
                        // console.log("FIRST TIME");

                        //create kadar upah
                        var respondUpah = await KadarUpahModel.create(dataKadar,{
                            transaction : transaction
                        })

                        //Update kadar upah kat table prod balik
                        switch(flowProduction) {
                            case "potong":
                                data["id_kadar_upah_potong"] = respondUpah.id_kadar_upah
                                break;
                            case "jahit":             
                                data["id_kadar_upah_jahit"] = respondUpah.id_kadar_upah
                                break;
                            case "butang":
                                data["id_kadar_upah_butang"] = respondUpah.id_kadar_upah
                                break;
                            case "sulam":
                                data["id_kadar_upah_sulam"] = respondUpah.id_kadar_upah
                        }



                    }
                    else
                    {
                        // console.log("SECOND TIME");

                        //check dah create invoice ke. kalau belum tak perlu
                        var arrayInv = [];

                        for (var kadarUpah of existKadarUpah)
                        {
                            //Check ada invoice tak
                            var existInvoice = await KadarUpahInvoiceModel.findOne({
                                where : { id_kadar_upah : kadarUpah.id_kadar_upah}
                            })

                            if (existInvoice)
                            {
                                arrayInv.push("yes");
                            }
                            else
                            {
                                arrayInv.push("no");
                                switch(flowProduction) {
                                    case "potong":
                                        data["id_kadar_upah_potong"] = kadarUpah.id_kadar_upah
                                        break;
                                    case "jahit":             
                                        data["id_kadar_upah_jahit"] = kadarUpah.id_kadar_upah
                                        break;
                                    case "butang":
                                        data["id_kadar_upah_butang"] = kadarUpah.id_kadar_upah
                                        break;
                                    case "sulam":
                                        data["id_kadar_upah_sulam"] = kadarUpah.id_kadar_upah
                                }                                         
                            }
                        
                        }

                        var check = arrayInv.includes("no");

                        // arrayInv
                        // console.log("check:"+arrayInv);
                        // console.log("check:"+check);

                        if (!check)
                        {
                            //invoice sebelum ni dah hantar, so kena create kadar upah baru utk kontrak sama
                            var respondBaru = await KadarUpahModel.create(dataKadar,{
                                transaction : transaction
                            })

                            switch(flowProduction) {
                                case "potong":
                                    data["id_kadar_upah_potong"] = respondBaru.id_kadar_upah
                                    break;
                                case "jahit":             
                                    data["id_kadar_upah_jahit"] = respondBaru.id_kadar_upah
                                    break;
                                case "butang":
                                    data["id_kadar_upah_butang"] = respondBaru.id_kadar_upah
                                    break;
                                case "sulam":
                                    data["id_kadar_upah_sulam"] = respondBaru.id_kadar_upah
                            }                            
                        }
                        


                    }
                    

                }

                await TempahanProductionModel.update(data,{
                    where : { barcode : req.body.barcode },
                    transaction : transaction
                });   


                await transaction.commit();

                return res.status(200).send({ "message" : "Success Scan" });
            }

            



        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },


    async getListTempahanPackaging(req, res) {
        try {



            var statusSelesai = await Helper.getIdKodKedua("SLS", 'ref_status_production')
            var statusBelumAgih = await Helper.getIdKodKedua("BEA", 'ref_status_production')


            var statusPackaging = req.body.statusPackaging;

            var status;

            switch(statusPackaging) {
                case "belumPacking":
                    status = statusBelumAgih
                    break;
                case "selesaiPacking":             
                    status = statusSelesai
                    break;
                default:
                    status = [statusBelumAgih,statusSelesai]
            }


            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;

            var listTempahan = await TempahanUkuranModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),   
                where : Helper.filterJoin(req, [
                    {
                        model : TempahanUkuranModel,
                        columnsLike : [
                            'kod_tempahan'                        
                        ]
                    },
                    {
                        model : TempahanPemakaiModel,
                        columnsLike : [
                            'nama',     
                            'no_telefon'                   
                        ],
                        joinAlias : 'Pemakai'
                    },
                    {
                        model : KontrakModel,
                        columnsEqual : ['id_kontrak'],
                        joinAlias : 'Pemakai->Kontrak'
                    },                    
                    {
                        model : DesignPakaianModel,
                        columnsLike : [
                            'kod_design'                        
                        ],
                        joinAlias : 'DesignPakaian'
                    },

                ], true),    
                attributes: [
                    "id_tempahan_ukuran",
                    "kod_tempahan",
                    // "JenisPakaian.keterangan"
                    [sequelize.fn("COUNT", sequelize.col("Production.id_tempahan_production")), "ProdCount"],
                    // [sequelize.col("JenisPakaian.keterangan"),'jenis_pakaian']                    
                ],                             
                order : [['id_tempahan_ukuran', 'DESC']],      
                include : [
                    {
                        model : TempahanProductionModel,
                        as : "Production",
                        attributes: [],
                        where : { status_packaging : status },
                    },                        
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
                
                ],
                group:["tempahanUkuran.id_tempahan_ukuran","DesignPakaian.id_dsgn_pakaian",
                "DesignPakaian->JenisPakaian.id_kod_kedua","Pemakai.id_pemakai_tempahan","Pemakai->Kontrak.id_kontrak",
                "Pemakai->Kontrak->Syarikat.id_syarikat","Pemakai->StatusPemakai.id_kod_kedua"],                

            });

            // var listTempahan2 = await TempahanUkuranModel.findAll({
            //     attributes: [
            //            "id_tempahan_ukuran",
            //            [sequelize.fn("COUNT", sequelize.col("Production.id_tempahan_production")), "ProdCount"]
            //     ],
            //     include : [
            //         {
            //             model : TempahanProductionModel,
            //             as : "Production",
            //             attributes: [],
            //             where : { status_packaging : statusBelumAgih },
            //         }, 
            //     ],
            //     group:["tempahanUkuran.id_tempahan_ukuran"]
            // })

            return res.status(200).send({                
                'totalSize' : listTempahan.count.length,
                'sizePerPage' : pageSize,
                'page' : page,    
                'data' : listTempahan.rows,            
            });


            
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getStatusCountPackaging (req,res) {
        try {


            const kod_status = ["belumPacking","selesaiPacking"];

            var kod_kedua = {
                belumagih : "BEA",
                selesai : "SLS"
            };

            var kod_status_kod = "";
            var arr_status_cnt = [];
            

            for (var item of kod_status){  
                var status_count = {};
                switch(item) {
                    case "selesaiPacking":
                        kod_status_kod = kod_kedua.selesai; 
                        break;
                    case "belumPacking":
                        kod_status_kod = kod_kedua.belumagih; 
                }

                const showStatus = await TempahanProductionModel.count({
                    include: [
                        {
                            model : KodKeduaModel,
                            as : "StatusPackaging",
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

            
            return res.status(200).send(arr_status_cnt);
        } catch (error) {
            console.log(error)
            return res.status(400).send(error);
        }
    },


    async assignToPackaging(req,res) {
        try {

            const transaction = await TempahanProductionModel.sequelize.transaction();

            var arrayIdTempahanUkuran = req.body.arrayTempahanUkuran
            
            var statusSelesai = await Helper.getIdKodKedua("SLS", 'ref_status_production')
            var statusBelumAgih = await Helper.getIdKodKedua("BEA", 'ref_status_production')

            var mesej = "";
            if (arrayIdTempahanUkuran){

                if (arrayIdTempahanUkuran.length>0)
                {

                    var statusSelesai = await Helper.getIdKodKedua("SLS", 'ref_status_production')
                 
                    /*update Prod: 
                    -status_packaging = selesai
                    -tarikh_mula_packaging
                    -tarikh_akhir_packaging 

                    */
                    const data = {
                        "status_packaging" : statusSelesai,
                        "tarikh_mula_packaging" : moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
                        "tarikh_akhir_packaging" : moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
                    }

                    await TempahanProductionModel.update(data,{
                        where : { 
                            id_tempahan_ukuran : arrayIdTempahanUkuran,
                            status_packaging : statusBelumAgih

                        },
                        transaction : transaction
                    })



                    await transaction.commit();
                    return res.status(200).send({"status": "Tempahan sudah packing"});

    
                }                 
            }
            else
            {
                mesej = "no variable declare"
            }

            return res.status(200).send({"status": mesej});

        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        } 
    },

    async cetakSenaraiUkuranPacking(req,res){
        try {

                /*
                    Senarai Tempahang Packing
                    Nama Pemakai
                    Kod Buku
                    Kontrak
                    Jawatan
                    No Telefon
                    Senarai Tempahan                        
                */  

                var arrayIdTempahanUkuran = req.body.arrayTempahanUkuran
                var aliasProduction = "";
                var filterProduction  = {};

                // var statusProductionProses = await Helper.getIdKodKedua("PRS","ref_status_production");

 
                //get distinct list nama pemakai 
                const listPemakai = await TempahanUkuranModel.findAll({
                    attributes : ["id_pemakai_tempahan"],
                    where : { id_tempahan_ukuran : arrayIdTempahanUkuran },
                    group : ["id_pemakai_tempahan"]
                });

                var listTempahanPemakai;

                //check ada pemakai tak
                if (listPemakai.length>0)
                {
                    var arrayIdPemakai = []
                    for (var pemakai of listPemakai)
                    {
                        arrayIdPemakai.push(pemakai.dataValues.id_pemakai_tempahan);
                    }

                    listTempahanPemakai = await TempahanPemakaiModel.findAll({
                        where : { id_pemakai_tempahan : arrayIdPemakai },
                        attributes : ["nama","kod_buku","no_telefon","jawatan"],
                        include: [
                            {
                                model : KontrakModel,
                                as : "Kontrak",
                                required : true, 
                                attributes : ["kod_kontrak"]               
                            },                                                                      
                            {
                                model : TempahanUkuranModel,
                                as : "SenaraiTempahan",
                                where : { id_tempahan_ukuran : arrayIdTempahanUkuran },
                                include : [
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
                            }
        
                        ]
    
                    }) 


                    //html mapping per Pemakai

                    var htmlPemakai = "";

                    for (var detailPemakai of listTempahanPemakai)
                    {
                        var html = fs.readFileSync(path.resolve(process.env.ROOT_URL, 'template/senaraiPackaging/sub_tempahan_list.html'), 'utf8');

                        html = html.replace('{namaPemakai}', detailPemakai.nama.toUpperCase());
                        html = html.replace('{kodBuku}', detailPemakai.kod_buku);
                        html = html.replace('{kontrak}', detailPemakai.Kontrak.kod_kontrak);
                        html = html.replace('{jawatan}', detailPemakai.jawatan);
                        html = html.replace('{notelefon}', detailPemakai.no_telefon);

                        
 
                        var senaraiTempahan = detailPemakai.SenaraiTempahan
                        //List Tempahan
                        var listTempahanProd = ""                        
                        for (var listTempahan of senaraiTempahan)
                        {
                            //get count Prod Yg Belum Packaging as for now
                            var listProdPackaging = await TempahanProductionModel.findAndCountAll({
                                where : { 
                                    id_tempahan_ukuran : listTempahan.id_tempahan_ukuran,
                                    status_packaging : await Helper.getIdKodKedua("BEA", 'ref_status_production')
                                }
                            });
            

  
                            listTempahanProd += "<tr>"
                            listTempahanProd += "<td>"+listTempahan.kod_tempahan+"</td>"
                            listTempahanProd += "<td>"+listTempahan.DesignPakaian.JenisPakaian.keterangan+"</td>"
                            listTempahanProd += "<td>"+listProdPackaging.count+"</td>"
                            listTempahanProd += "</tr>"
 
                        }
  
 


                        html = html.replace('{listTempahanPackaging}', listTempahanProd);

 
                        htmlPemakai += html

                    }


                    var htmlMainPemakai = fs.readFileSync(path.resolve(process.env.ROOT_URL, 'template/senaraiPackaging/main_packaging.html'), 'utf8');
                    htmlMainPemakai = htmlMainPemakai.replace('{template}', htmlPemakai);

 
                    var options = { 
                        // format: 'Letter' , 
                        type: "pdf",
                    };
        
                    function downloadPdf() {
                        return new Promise((resolve, reject) => {
                            return pdf.create(htmlMainPemakai).toStream(function (err, stream) {
                                if (err) return res.send(err);
                                res.type('pdf');
                                stream.pipe(res);               
                            });
                        });  
                    } 
        
                    await downloadPdf(htmlMainPemakai, options);
                }

                return res.status(200).send(listTempahanTukang);
            
        } catch (error) {
            console.log(error)
            return res.status(400).send(error);
        }
    },



    checkButangSulamQc(checkPoint,item)
    {

        if (checkPoint == "sulam")
        {
            var checkButang = item.is_butang;
            var statusButang = null;
            if (item.StatusButang)
            {
                statusButang =  item.StatusButang.kod_ref; 
            }

            var checkQC= item.is_qc;
            var statusQC = null
            if (item.StatusQC)
            {
                statusQC = item.StatusQC.kod_ref; 
            }

            
            //check 
            if (checkButang && checkQC)
            {
                //ada butang dan QC
                //check dua2 selesai 
                if (statusButang == "SLS" && statusQC == "SLS")
                {
                    return true;
                }
            }
            else if (!checkButang && !checkQC)
            {
                //takde butang dan QC,boleh proceed packing
                return true;
            }
            else
            {
                //samada butang atau qc
      
                if (statusButang == "SLS")
                { return true; }
                else if (statusQC == "SLS")
                { return true; }
                    
            }

        }
        else if (checkPoint == "butang")
        {
            
            var checkSulam = item.is_sulam;
            var statusSulam = null;
            if (item.StatusSulam)
            {
                statusSulam = item.StatusSulam.kod_ref;
            }

            var checkQC= item.is_qc;
            var statusQC = null
            if (item.StatusQC)
            {
                statusQC = item.StatusQC.kod_ref; 
            }
            


            if (checkSulam && checkQC)
            {
                //ada sulam dan QC
                //check dua2 selesai 
                if (statusSulam == "SLS" && statusQC == "SLS")
                {
                    return true;
                }
            }
            else if (!checkSulam && !checkQC)
            {
                //takde sulam dan QC,boleh proceed packing
                return true;
            }
            else
            {
                //samada butang atau qc
      
                if (statusSulam == "SLS")
                {                 console.log("NI")
                return true; }
                else if (statusQC == "SLS")
                {                 console.log("NIkot")
                return true; }
                    
            }            

        }
        else if (checkPoint == "qc")
        {
            var checkSulam = item.is_sulam;
            var statusSulam = null;
            if (item.StatusSulam)
            {
                statusSulam = item.StatusSulam.kod_ref;
            }
    
            var checkButang = item.is_butang;
            var statusButang = null;
            if (item.StatusButang)
            {
                statusButang =  item.StatusButang.kod_ref; 
            }

            if (checkSulam && checkButang)
            {
                //ada sulam dan QC
                //check dua2 selesai 
                if (statusSulam == "SLS" && statusButang == "SLS")
                {
                    return true;
                }
            }
            else if (!checkSulam && !checkButang)
            {
                //takde sulam dan QC,boleh proceed packing
                return true;
            }
            else
            {
                //samada butang atau qc
      
                if (statusSulam == "SLS")
                { return true; }
                else if (statusButang == "SLS")
                { return true; }
                    
            }       
            
        }

    },

    base64_encode(file) {
        return "data:image/gif;base64,"+fs.readFileSync(file, 'base64');
    },

}

module.exports = Production;