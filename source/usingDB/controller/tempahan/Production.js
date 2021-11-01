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
const moment = require("moment");

const Production = {

    async senaraiProduction (req,res) {
        try {

            console.log("test");
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

    async getDetailTempahanPemakai (req,res){
        try {

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
                    {
                        model : TempahanUkuranModel,
                        as : "TempahanUkuran",
                        required : true,
                        attributes: ["id_pemakai_tempahan","id_dsgn_pakaian","id_jenis_pakaian","bilangan","kod_tempahan"],
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

                }
                else if (flowProduction == "butang")
                {
                    data["id_tukang_butang"] = req.body.idTukang;
                    data["status_butang"] = idStatusPendingAgih;

                }
                else if (flowProduction == "qc")
                {
                    data["id_tukang_qc"] = req.body.idTukang;
                    data["status_qc"] = idStatusPendingAgih;

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
            const transaction = await TempahanProductionModel.sequelize.transaction();

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

    }



}

module.exports = Production;