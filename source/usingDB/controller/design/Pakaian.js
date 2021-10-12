const DesignPakaianModel = require("../../models/sequelize/DesignPakaian");
const DesignLogoModel = require("../../models/sequelize/DesignLogo");
const KodKeduaModel = require("../../models/sequelize/KodKedua");
const SyarikatModel = require("../../models/sequelize/Syarikat");



const Helper = require("../../controller/Helper");
const { Op } = require("sequelize");
const moment = require("moment");

const fs = require('fs-extra')

const Pakaian = {

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

            const transaction = await DesignPakaianModel.sequelize.transaction();
 
            //Data pakaian 
            const data = { 
                "kod_design" : await Helper.genRunningNo("kod_pakaian"),
                "tarikh_design" : moment(new Date()).format('YYYY/MM/DD'),
                "keterangan" : req.body.keterangan,
                "id_jenis_pakaian" : req.body.id_jenis_pakaian,
                "id_jawatan" : req.body.id_jawatan,
                "id_kategori" : req.body.id_kategori,
                "id_logo" : req.body.id_logo,
                "is_butang" : req.body.is_butang,
                "is_sulam" : req.body.is_sulam,
                "is_qc" : req.body.is_qc,
                "is_aktif" : req.body.is_aktif,
                "nota" : req.body.nota,

                //Image
                "file_name": req.file.filename,
                "file_path": req.file.destination+"/",
                "file_mimetype": req.file.mimetype,
                "file_original_name": req.file.originalname,

            };



            //Data Jenis Kain
            var kain = req.body.kain;

            //if kain exist
            if (kain)
            {
                if (kain.length>0)
                {
                    for (var item of kain){  
                        const objItem = JSON.parse(item);
    
    
                        console.log(objItem.id_jenis_kain);
                        console.log(objItem.warna);
    
                    }    
    
                }
    
    
            }
        

            //Data Butang/Zip

            //Data Piping 

            //Data Aksesori




            var pakaian;
            if (req.body.id_dsgn_pakaian)
            {

                var existPakaian = await DesignPakaianModel.findByPk(req.body.id_dsgn_pakaian, {
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                    });

 
                if(!existPakaian)
                {
                    return res.status(404).send({'message': 'Detail logo tidak dijumpai'});
                }

                //Delete existing pakaian image

                var filePath = process.env.DOCUMENTS+ existPakaian.file_path+"/"+existPakaian.file_name;


                //Kena tambah logik file wujud ke tak. Pending lagi.

                if (fs.existsSync(filePath)) 
                {
                    //file exists
                    console.log(filePath);
                    fs.unlink(filePath, (err) => {
                        if (err){
                            return res.status(400).send({"message" : "Gagal memadam dokumen. Sila delete Kod Pakaian"});
                        }        
                    });
    
                }
                else
                {
                    console.log("***************************************");
                    console.log("Logo file tak wujud semasa update pakaian. Upload new image.");
                    console.log("***************************************");
                }


 


                
                pakaian = await existPakaian.update(data, {
                    transaction : transaction
                });                

            }
            else
            {
                //Create
                pakaian = await DesignPakaianModel.create(data, {
                    transaction : transaction
                });   



            }

 


            //Upload Picture

            await transaction.commit();
            return res.status(200).send(pakaian);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getList(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;
 
            var listLogo = await DesignPakaianModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_dsgn_pakaian', 'DESC']],
                include : [
                    {                                
                        model : KodKeduaModel,
                        as : 'Jawatan',
                        attributes: ['kod_ref','keterangan']                    
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisPakaian',
                        attributes: ['kod_ref','keterangan']                    
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'Kategori',
                        attributes: ['kod_ref','keterangan']                    
                    },
                    {                                
                        model : DesignLogoModel,
                        as : 'Logo',
                        attributes: { 
                            exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                        include : [
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisKain',
                                attributes: ['kod_ref','keterangan']                    
                            },
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisPatch',
                                attributes: ['kod_ref','keterangan']                    
                            },
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisSulaman',
                                attributes: ['kod_ref','keterangan']                    
                            },
                            {                                
                                model : SyarikatModel,
                                as : 'Syarikat',
                                attributes: ['kod_syarikat','nama_syarikat']                    
                            },
                                    
                        ]   

                    },

                    
                ]                

            });
                            
            if (!listLogo){
                return res.status(404).send({'message': 'List pindah kayu tidak dijumpai'});
            }

            return res.status(200).send({
                'totalSize' : listLogo.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : listLogo.rows,
            });


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getDetails(req, res) {
        try {
 
            var detailPakaian = await DesignPakaianModel.findByPk(req.params.id,{       
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                order : [['id_dsgn_pakaian', 'DESC']],
                include : [
                    {                                
                        model : KodKeduaModel,
                        as : 'Jawatan',
                        attributes: ['kod_ref','keterangan']                    
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisPakaian',
                        attributes: ['kod_ref','keterangan']                    
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'Kategori',
                        attributes: ['kod_ref','keterangan']                    
                    },
                    {                                
                        model : DesignLogoModel,
                        as : 'Logo',
                        attributes: { 
                            exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                        include : [
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisKain',
                                attributes: ['kod_ref','keterangan']                    
                            },
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisPatch',
                                attributes: ['kod_ref','keterangan']                    
                            },
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisSulaman',
                                attributes: ['kod_ref','keterangan']                    
                            },
                            {                                
                                model : SyarikatModel,
                                as : 'Syarikat',
                                attributes: ['kod_syarikat','nama_syarikat']                    
                            },
                                    
                        ]   

                    },

                    
                ]                
             

            });
                            
            if (!detailPakaian){
                return res.status(404).send({'message': 'Detail pakaian tidak dijumpai'});
            }



            return res.status(200).send(detailPakaian);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

}

module.exports = Pakaian;