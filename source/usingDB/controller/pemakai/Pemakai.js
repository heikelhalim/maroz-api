const PemakaiModel = require("../../models/sequelize/Pemakai");
const SyarikatModel = require("../../models/sequelize/Syarikat");
const KontrakModel = require("../../models/sequelize/Kontrak");
const TempahanPemakaiModel = require("../../models/sequelize/TempahanPemakai");

const StaffModel = require("../../models/sequelize/User");
const UserJobModel = require("../../models/sequelize/UserJob");
const KodKeduaModel = require("../../models/sequelize/KodKedua");



const Helper = require("../../controller/Helper");
const { Op } = require("sequelize");
const { moment } = require("moment");



const Pemakai = {

    /**
    * SignUp
    * @param {object} req 
    * @param {object} res
    * @returns {object} user object 
    */
    async create(req, res) {
        try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
            // const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     return res.status(422).json({ errors: errors.array() });
            // }

            const transaction = await PemakaiModel.sequelize.transaction();

            var data = { 
                "kod_buku" : req.body.kod_buku,
                "no_kp" : req.body.no_kp,
                "nama" :  req.body.nama,
                "is_active" : true ,
                "status" : req.body.status ,
                "jantina" : req.body.jantina ,
                "nama_tag" : req.body.nama_tag ,
                "no_telefon" : req.body.no_telefon ,
                "email" : req.body.email ,
                "id_syarikat" : req.body.id_syarikat,
                "jawatan" :  req.body.jawatan 
            };

            var pemakai;
            if (req.body.id_pemakai)
            {
                //Update

                var existPemakai = await PemakaiModel.findByPk(req.body.id_pemakai, {
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
                pemakai = await PemakaiModel.create(data, {
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

    async getList(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;


            var includeArray = [];

            var modelTempahanPemakai = {};
            var modelSyarikat = {};


            var customFilter = req.body.customFilter;
            var conditionPemakai = [
                Helper.filterJoin(req, [
                    {
                        model : PemakaiModel,
                        columnsLike : [
                            'kod_buku',
                            'nama'
                        ]
                    }
                ])           
            ];
            

            switch(customFilter.jenispage) {
                case "pelanggan":

                    var conditionsyarikat = {};
                    var isRequiredSys = false;
                    if (customFilter.id_syarikat)
                    {
                        //filter by syarikat, if null default semua pemakai
                        conditionsyarikat["id_syarikat"] = customFilter.id_syarikat;
                        isRequiredSys = true;
                    }

                    var modelSyarikat = {
                        model : SyarikatModel,
                        as : 'Syarikat',
                        where : conditionsyarikat,
                        required : isRequiredSys,
                        attributes: ['nama_syarikat','kod_syarikat']     
                    };
    
                    includeArray.push(modelSyarikat); 
                  break;
                case "kontrak":

                     //Listing Based on TempahanPemakai - View Page Kontrak
                    var isRequired;
    
                    var arrayidpemakai = [];

                    if (customFilter.is_dipilih == true)
                    {
                        //List pemakai sudah dipilih utk kontak
                        isRequired = true;

                        modelTempahanPemakai = {
                            model : TempahanPemakaiModel,
                            as : 'TempahanPemakai',
                            where : { id_kontrak : customFilter.id_kontrak },
                            required : isRequired,
                            attributes: ['id_pemakai_tempahan','jenis_tempahan'],
                            include : [
                                {
                                    model : KontrakModel,
                                    as : 'Kontrak',
                                    required : true,
                                    attributes: ['kod_kontrak'],
                                }
                            ] 
                        }
        
                        includeArray.push(modelTempahanPemakai);

                    }
                    else
                    {
                        //List pemakai belum dipilih utk kontrak    

                        var listTempahanPemakai = await TempahanPemakaiModel.findAll({
                            attributes: ["id_pemakai_tempahan","id_pemakai","id_kontrak"],
                            where : { id_kontrak : customFilter.id_kontrak }
                        });

                        //map id_pemakai to not include in table Pemakai
                        for (var idPemakai of listTempahanPemakai)
                        {
                            arrayidpemakai.push(idPemakai.id_pemakai);
                        }
                        
                        //get id syarikat from kontrak
                        const syarikatkontrak = await KontrakModel.findOne({
                            attributes : ["id_syarikat"],
                            where : { id_kontrak : customFilter.id_kontrak }
                        });


                        conditionPemakai.push(
                            {
                                id_pemakai : {
                                    [Op.notIn] : arrayidpemakai
                                },
                                id_syarikat : syarikatkontrak.id_syarikat
                            }
                        );



                    }
    
                  break;
                default:
                  // code block
              }


 
            var listpemakai = await PemakaiModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_pemakai', 'DESC']],
                where : {
                    [Op.and] : conditionPemakai

                },
                include : includeArray

            });
                            
            return res.status(200).send({
                'totalSize' : listpemakai.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : listpemakai.rows,
            });


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getDetails(req, res) {
        try {

            var detailsPemakai = await PemakaiModel.findByPk(req.params.id,{
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                include : [
                    {                                
                        model : SyarikatModel,
                        as : 'Syarikat',
                        attributes: ['nama_syarikat','kod_syarikat']                    
                    },
                    
                ] 
            });

            if (!detailsPemakai){
                return res.status(404).send({'message': 'Details Pemakai tidak dijumpai'});
            }

            return res.status(200).send(detailsPemakai);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async creatNonSystemUser(req, res) {
        try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
            // const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     return res.status(422).json({ errors: errors.array() });
            // }

            const transaction = await StaffModel.sequelize.transaction();

            const dataPengguna = { 
                "nama" : req.body.nama,
                "email" : req.body.email,
                "nama_pengguna" : req.body.nama_pengguna,
                "isActive" : req.body.isActive,
                "is_pengguna_sistem" : false 
            };


            var pengguna;
            if (req.body.id_pengguna)
            {

                var existPengguna = await StaffModel.findByPk(req.body.id_pengguna, {
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                    });

 
                if(!existPengguna)
                {
                    return res.status(404).send({'message': 'Detail pengguna tidak dijumpai'});
                }


                
                pengguna = await existPengguna.update(dataPengguna, {
                    transaction : transaction
                });                

            }
            else
            {
                //Create
                pengguna = await StaffModel.create(dataPengguna, {
                    transaction : transaction
                });   



            }


            await transaction.commit();
            return res.status(200).send(pengguna);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getListStaff(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 50;
            const page = req.body.page || 1;


            var conditionRole = {};
            var checkReqRole =false;
            if (req.body.role)
            {
                checkReqRole = true;
                conditionRole["kod_ref"] = req.body.role
            }
   
 
            var liststaff = await StaffModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_pengguna', 'DESC']],
                // where : {
                //     [Op.and] : conditionPemakai

                // },
                include : [
                    {                                
                        model : UserJobModel,
                        as : 'Job',
                        required : true,
                        attributes: ['id_pengguna','id_job'],
                        include : [
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisJob',
                                required : checkReqRole,
                                where : conditionRole,
                                attributes: ['kod_ref','keterangan']                    
                            },
                        ]                    
                    },                    
                ]

            });
                            
            return res.status(200).send({
                'totalSize' : liststaff.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : liststaff.rows,
            });


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    }


}

module.exports = Pemakai;