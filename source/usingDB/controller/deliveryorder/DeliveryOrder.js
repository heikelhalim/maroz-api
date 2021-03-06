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

const { Op } = require("sequelize");
const sequelize = require("sequelize");

const fs = require('fs');  
const path = require('path');
const pdf = require('html-pdf');

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
                        attributes : ["kod_kontrak","id_kontrak","tajuk_ringkas"],
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

            var modifiedList = [];
            for (var item of listDO.rows)
            {
                //get bilangan DO
                
                var details = await TempahanProductionModel.findAndCountAll({
                    where : { id_do : item.dataValues.id_do}
                });


                item.dataValues.bilangan = details.count
                modifiedList.push(item);
            }
                            
            listDO.rows = modifiedList;

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

            var conditionDO = {};
            if (req.body.status == "pending")
            {
                //belum select utk DO - null
                conditionDO = { [Op.is]: null };
            }
            else if (req.body.status == "selected")
            {
                //dah pilih untuk DO - not null
                if (req.body.id_do)
                {
                    //keluarkan list yg dah dah ada DO
                    conditionDO = req.body.id_do;
                }
                else
                {
                    //return terus null data dulu sbb baru create DO
                    return res.status(200).send({
                        'totalSize' : 0,
                        'sizePerPage' : pageSize,
                        'page' : page,
                        'data' : [],
                    });

                }
 
            }
            else
            {
                conditionDO = { [Op.is]: null };
            }

            // var listProductionSelesai = await TempahanProductionModel.findAndCountAll({
            //     subQuery: false,
            //     distinct : true,
            //     limit : pageSize, 
            //     where : {
            //         id_do : conditionDO,
            //     },
            //     offset : Helper.offset(page, pageSize),   
            //     include : [
            //         {
            //             model : KodKeduaModel,
            //             as : "StatusPackaging",
            //             required : true,
            //             where : { kod_ref : "SLS" }, //selesai packaging
            //             attributes: ['kod_ref','keterangan'] 
            //         },
            //         {
            //             model : TempahanUkuranModel,
            //             as : "TempahanUkuran",
            //             required : true,
            //             attributes: ["id_pemakai_tempahan","id_dsgn_pakaian","id_jenis_pakaian","kod_tempahan"],
            //             include : [
            //                 {
            //                     model : TempahanPemakaiModel,
            //                     as : "Pemakai",
            //                     required : true,
            //                     attributes: { 
            //                         exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
            //                    },
            //                    include : [
            //                         {
            //                             model : KontrakModel,
            //                             as : "Kontrak",
            //                             required : true, 
            //                             where : { id_kontrak : req.body.id_kontrak},
            //                             attributes : ["id_kontrak","kod_kontrak",'tajuk_ringkas'],
            //                             include : [
            //                                 {                                
            //                                     model : SyarikatModel,
            //                                     as : 'Syarikat',
            //                                     attributes: ['nama_syarikat','kod_syarikat']                    
            //                                 },
            //                             ]                 
            //                         }                                   
            //                    ]
            //                 },
            //                 {
            //                     model : DesignPakaianModel,
            //                     as : 'DesignPakaian',
            //                     attributes: ["kod_design"],
            //                     include : [
            //                         {                                
            //                             model : KodKeduaModel,
            //                             as : 'JenisPakaian',
            //                             attributes: ['kod_ref','keterangan']                   
            //                         },
            //                     ]
            //                 }                               
            //             ]
            //         }

            //     ],
            //     order : [['id_tempahan_production', 'DESC']],

            // });


            var listProductionSelesai = await TempahanUkuranModel.findAndCountAll({
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
                        required : true,
                        attributes: [],
                        where : { 
                            id_do : conditionDO,
                            status_packaging : await Helper.getIdKodKedua("SLS", 'ref_status_production')
                        }
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
                                where : { id_kontrak : req.body.id_kontrak },                                
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
    
    async createDO (req,res){
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





        //Update TempahanProd assign for DO
        if (body.listTempahan)
        {
            if (body.listTempahan.length>0)
            {
                //Get list prod yg 

                for (var id of body.listTempahan)
                {

                    const dataProd = {
                        "id_do" : deliveryorder.id_do
                    }
        
                    await TempahanProductionModel.update(dataProd,{
                        where : { 
                            id_tempahan_ukuran : id,
                            status_packaging : await Helper.getIdKodKedua("SLS", 'ref_status_production')
                        },   
                        transaction : transaction
                    })                    
                }
    
            }
        }

        //Revert Tempahan yg dah selected DO
        if (body.listTempahanRevert)
        {
            if (body.listTempahanRevert.length>0)
            {
                const dataProdRev = {
                    "id_do" : null
                }
    
                await TempahanProductionModel.update(dataProdRev,{
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

    async deleteDO (req,res){
        try {

            //update id_do in Prod
            const transaction = await DeliveryOrderModel.sequelize.transaction();

            const data = { id_do : null }
            
            await TempahanProductionModel.update(data,{
                where : { id_do : req.params.id },
                transaction : transaction
            })


            //Delete DO
            const delDo = await DeliveryOrderModel.destroy({
                where : {
                    "id_do" : req.params.id
                },
                force : true,
                transaction : transaction
            });
                

            await transaction.commit();
            return res.status(200).send({ status : "delete" });


            
        } catch (error) {
            return res.status(400).send(error);
        }
    },

    async assignTempahanforDO (req,res){
        try {
            


        } catch (error) {
            return res.status(400).send(error);
        }
    },

    async cetakDO(req,res){
        try {


            var infoDO = await DeliveryOrderModel.findByPk(req.params.id,{
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
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
                        attributes : ["kod_kontrak","id_kontrak","tajuk_ringkas"],
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


            var listDO = await TempahanUkuranModel.findAll({
                subQuery: false,
                distinct : true,
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
                        required : true,
                        attributes: [],
                        where : { 
                            id_do : req.params.id,
                        }
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
                                // where : { id_kontrak : req.body.id_kontrak },                                
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


            // return res.status(200).send(listDO);


            //html mapping per Pemakai



            var html = fs.readFileSync(path.resolve(process.env.ROOT_URL, 'template/deliveryorder/main_do.html'), 'utf8');

            html = html.replace('{no_do}', infoDO.no_rujukan_do.toUpperCase());
            html = html.replace('{kontrak}', listDO[0].Pemakai.Kontrak.kod_kontrak);
            html = html.replace('{syarikat}', listDO[0].Pemakai.Kontrak.Syarikat.nama_syarikat);
          

            //List Tempahan
            var listDeliveryOrder = ""                        
            for (var itemDo of listDO)
            {
   
                var noTelefon = itemDo.Pemakai.no_telefon || '-'
                var jawatan = itemDo.Pemakai.jawatan || '-'
 

                listDeliveryOrder += "<tr>"
                listDeliveryOrder += "<td>"+itemDo.kod_tempahan+"</td>"
                listDeliveryOrder += "<td>"+itemDo.Pemakai.nama+"</td>"
                listDeliveryOrder += "<td>"+jawatan+"</td>"
                listDeliveryOrder += "<td>"+noTelefon+"</td>"
                listDeliveryOrder += "<td>"+itemDo.DesignPakaian.JenisPakaian.keterangan+"</td>"
                listDeliveryOrder += "<td>"+itemDo.dataValues.ProdCount+"</td>"
                listDeliveryOrder += "</tr>"

            }




            html = html.replace('{listTempahanDO}', listDeliveryOrder);


            var options = { 
                // format: 'Letter' , 
                type: "pdf",
            };

                    function downloadPdf() {
                        return new Promise((resolve, reject) => {
                            return pdf.create(html).toStream(function (err, stream) {
                                if (err) return res.send(err);
                                res.type('pdf');
                                stream.pipe(res);               
                            });
                        });  
                    } 
        
                    await downloadPdf(html, options);

                return res.status(200).send(listTempahanTukang);
            
        } catch (error) {
            console.log(error)
            return res.status(400).send(error);
        }
    },


}


module.exports = DeliveryOrder;