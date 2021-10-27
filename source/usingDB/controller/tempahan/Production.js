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
const TempahanUkuran = require("../../models/sequelize/TempahanUkuran");

const Production = {

    async senaraiProduction (req,res) {
        try {

            const pageSize = req.body.sizePerPage || 100;
            const page = req.body.page || 1;


            var flowProduction = req.body.flowProduction; // potong,jahit,sulam,butang,qc,packing
            var statusProduction = req.body.statusProduction; //belumagih,pendingagih,proses,selesai

            var filterFlow = {};
            var aliasStatus = "";

            if (flowProduction == "potong")
            {
                aliasStatus = "StatusPotong";
                filterFlow["is_potong"] = true;
            }
            else if (flowProduction == "jahit")
            {
                aliasStatus = "StatusJahit";
                filterFlow["is_jahit"] = true;
            }
            else if (flowProduction == "sulam")
            {
                aliasStatus = "StatusSulam";
                filterFlow["is_sulam"] = true;
            }
            else if (flowProduction == "butang")
            {
                aliasStatus = "StatusButang";
                filterFlow["is_butang"] = true;
            }
            else if (flowProduction == "qc")
            {
                aliasStatus = "StatusQC";
                filterFlow["is_qc"] = true;
            }
            else if (flowProduction == "packing")
            {
                aliasStatus = "StatusPackaging";
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
                        model : TempahanUkuranModel,
                        as : "TempahanUkuran",
                        required : true,
                        attributes: ["id_pemakai_tempahan","id_dsgn_pakaian","id_jenis_pakaian"],
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
                    }

                ]

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

    async assignTukang (req,res) {
        try {
            


        } catch (error) {
            return res.status(400).send(error);
        }
    },
            
    async cetakBarcode (req,res) {
        try {
            


        } catch (error) {
            return res.status(400).send(error);
        }
    },

    async cetakDesign (req,res) {
        try {
            


        } catch (error) {
            return res.status(400).send(error);
        }
    },

    async barcodeScanSelesaiProses (req,res) {
        try {
            const transaction = await TempahanUkuranModel.sequelize.transaction();

            var flowProduction = req.body.flowProduction; // potong,jahit,sulam,butang,qc,packing
            var statusSelesai = await Helper.getIdKodKedua("SLS", 'ref_status_production')
            var statusBelumAgih = await Helper.getIdKodKedua("BEA", 'ref_status_production')

            var filter = {};

            //pass value barcode
            filter["barcode"] = req.body.barcode; 


            if (flowProduction == "potong")
            {
                filter["status_potong"] = statusSelesai;
            }
            else if (flowProduction == "jahit")
            {
                filter["status_jahit"] = statusSelesai;

            }
            else if (flowProduction == "sulam")
            {
                filter["status_sulam"] = statusSelesai;

            }
            else if (flowProduction == "butang")
            {
                filter["status_butang"] = statusSelesai;

            }
            else if (flowProduction == "qc")
            {

                filter["status_qc"] = statusSelesai;
            }
            else if (flowProduction == "packing")
            {
                filter["status_packing"] = statusSelesai;

            }

            var checkStatusDetailProd = await TempahanUkuranModel.findOne({
                where : filter            
            });

            //check data ni dah scan terima ke belum
            if (checkStatusDetailProd)
            {
                return res.status(403).send({"message" : "Tempahan ini sudah scan Selesai"});
            }
            else
            {                
                //Update status selesai
                var detailProd = await TempahanUkuranModel.findOne({
                    where : { barcode : req.body.barcode }            
                });


                if (flowProduction == "potong")
                {
                    filter["status_potong"] = statusSelesai;
                    filter["status_jahit"] = statusBelumAgih;
                }
                else if (flowProduction == "jahit")
                {
                    filter["status_jahit"] = statusSelesai;

                    //check prod perlu lalu flow ke
                    if (detailProd.is_sulam == true)
                    {
                        filter["status_sulam"] = statusBelumAgih;
                    }

                    if (detailProd.is_butang == true)
                    {
                        filter["status_butang"] = statusBelumAgih; 
                    }

                    if (detailProd.is_qc == true)
                    {
                        filter["status_qc"] = statusBelumAgih; 
                    }


                }
                else if (flowProduction == "sulam")
                {
                    filter["status_sulam"] = statusSelesai;


                    var isSelesai= this.checkButangSulamQc("sulam",detailProd);
    
                    //jika semua flow selesai, hantar ke packing
                    if (isSelesai)
                    {
                        filter["status_packing"] = statusBelumAgih;
                    }


                }
                else if (flowProduction == "butang")
                {
                    filter["status_butang"] = statusSelesai;
                    var isSelesai= this.checkButangSulamQc("butang",detailProd);
                    //jika semua flow selesai, hantar ke packing
                    if (isSelesai)
                    {
                        filter["status_packing"] = statusBelumAgih;
                    }
                    
    
                }
                else if (flowProduction == "qc")
                {
    
                    filter["status_qc"] = statusSelesai;
                    var isSelesai= this.checkButangSulamQc("qc",detailProd);
                    //jika semua flow selesai, hantar ke packing
                    if (isSelesai)
                    {
                        filter["status_packing"] = statusBelumAgih;
                    }
                    
                }
                else if (flowProduction == "packing")
                {
                    filter["status_packing"] = statusSelesai;
                }


                
                await detailProd.update(filter,{
                    transaction : transaction
                });   
            }

            



        } catch (error) {
            return res.status(400).send(error);
        }
    },

    async checkButangSulamQc(checkPoint,item)
    {

        if (checkPoint == "sulam")
        {
            var checkButang = item.is_butang;
            var statusButang = item.status_butang;
    
            var checkQC= item.is_qc;
            var statusQC = item.status_butang;

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
            var statusSulam = item.status_sulam;

            var checkQC= item.is_qc;
            var statusQC = item.status_butang;

        }
        else if (checkPoint == "qc")
        {
            var checkSulam = item.is_sulam;
            var statusSulam = item.status_sulam;
    
            var checkButang = item.is_butang;
            var statusButang = item.status_butang;
        }






    }



}

module.exports = Production;