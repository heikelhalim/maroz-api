const KontrakModel = require("../../models/sequelize/Kontrak");
const TempahanPemakaiModel = require("../../models/sequelize/TempahanPemakai");
const TempahanUkuranModel = require("../../models/sequelize/TempahanUkuran");
const SyarikatModel = require("../../models/sequelize/Syarikat");
// const PenggunaModel = require("../../models/sequelize/User")

const DesignPakaianModel = require("../../models/sequelize/DesignPakaian");
const TempahanProductionModel = require("../../models/sequelize/TempahanProduction");
const DeliveryOrderModel = require("../../models/sequelize/DeliveryOrder");
const KodKeduaModel = require("../../models/sequelize/KodKedua");


const Helper = require("../../controller/Helper");
const moment = require("moment");
const bodyParser = require("body-parser");


const DeliveryOrder = {

    async listDO (req,res){
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;
            
            var listDO = await DeliveryOrderModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_do', 'DESC']],
                include : [
                    {                                
                        model : KodKeduaModel,
                        as : 'Status',
                        attributes: ['kod_ref','keterangan']                   
                    },
                    {
                        model : KontrakModel,
                        as : "Kontrak",
                        required : true, 
                        attributes : ["kod_kontrak","id_kontrak"],
                        include : [
                            {                                
                                model : SyarikatModel,
                                as : 'Syarikat',
                                attributes: ['nama_syarikat','kod_syarikat']                    
                            },
                        ]              
                    }    
                ]

            });
                            
            return res.status(200).send({
                'totalSize' : listDO.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : listDO.rows,
            });



        } catch (error) {
            return res.status(400).send(error);
        }
    },

    async listTempahanSelesaiProd (req,res){
        try {
            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;

            var listProductionSelesai = await TempahanProductionModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),   
                include : [
                    {
                        model : KodKeduaModel,
                        as : "StatusPackaging",
                        required : true,
                        where : { kod_ref : "SLS" }, //selesai packaging
                        attributes: ['kod_ref','keterangan'] 
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
                                        attributes : ["id_kontrak","kod_kontrak",]               
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
                'totalSize' : listProductionSelesai.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : listProductionSelesai.rows,
            });


            
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },   
    
    async creatDO (req,res){
      try {
          
        const transaction = await DeliveryOrderModel.sequelize.transaction();

        const body = req.body;

        var data = { 
            "tarikh_hantar" : moment(body.tarikh_hantar).format('YYYY/MM/DD'),
            "id_kontrak" :  body.id_kontrak
        };

        if (body.status == 'simpan')
        {
            data["status"] = await Helper.getIdKodKedua("DRFT","ref_status_do")
        }
        else if (body.status == 'hantar')
        {
            data["status"] = await Helper.getIdKodKedua("HTR","ref_status_do")
        }


        var deliveryorder
        if (req.body.id_do)
        {
            //Update

            var existDO = await DeliveryOrderModel.findByPk(req.body.id_do, {
                attributes: { 
                    exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                    },
                });


            if(!existDO)
            {
                return res.status(404).send({'message': 'Detail pemakai tidak dijumpai'});
            }

            
            deliveryorder = await existDO.update(data, {
                transaction : transaction
            }); 


        }
        else
        {
            data["no_rujukan_do"] = await Helper.genRunningNo("delivery_order");
            //Create
            deliveryorder = await DeliveryOrderModel.create(data, {
                transaction : transaction
            });     
        }


        //Revert DO tu null on tempahan
        var listProductionSelesai = await TempahanProductionModel.findAll({
            subQuery: false,
            distinct : true,
            include : [
                {
                    model : KodKeduaModel,
                    as : "StatusPackaging",
                    required : true,
                    where : { kod_ref : "SLS" }, //selesai packaging
                    attributes: ['kod_ref','keterangan'] 
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
                                    where : { id_kontrak : req.body.id_kontrak }, 
                                    attributes : ["kod_kontrak",]               
                                }                                   
                           ]
                        },                          
                    ]
                }

            ]

        });


        if (listProductionSelesai)
        {
            
            if (listProductionSelesai.length>0)
            {
                var arrayProd = [];
                for (var idProd of listProductionSelesai)
                {
                    arrayProd.push(idProd.id_tempahan_production);
                }
    
                const dataRevert = {
                    "id_do" : null
                }
        
                await TempahanProductionModel.update(dataRevert,{
                    where : { id_tempahan_production : arrayProd },
                    transaction : transaction
                })
            }

            
        }



        //Update TempahanProd assign for DO
        if (body.listTempahan)
        {
            if (body.listTempahan.length>0)
            {
                const dataProd = {
                    "id_do" : deliveryorder.id_do
                }
    
                await TempahanProductionModel.update(dataProd,{
                    where : { id_tempahan_production : body.listTempahan },
                    transaction : transaction
                })
    
            }
        }


             
        await transaction.commit();

        return res.status(200).send(deliveryorder);


      } catch (error) {
        console.log(error);
        return res.status(400).send(error);
      }  
    },

    async detailsDO(req,res){
        try {


            
        } catch (error) {
            return res.status(400).send(error);
        }
    },

    async assignTempahanforDO (req,res){
        try {
            


        } catch (error) {
            return res.status(400).send(error);
        }
    }
}


module.exports = DeliveryOrder;