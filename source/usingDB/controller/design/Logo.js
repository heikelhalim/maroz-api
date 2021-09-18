const DesignLogoModel = require("../../models/sequelize/DesignLogo");
const KodKeduaModel = require("../../models/sequelize/KodKedua");
const SyarikatModel = require("../../models/sequelize/Syarikat");

const Helper = require("../../controller/Helper");

const fs = require('fs-extra')

const { Op } = require("sequelize");
const { moment } = require("moment");



const Logo = {

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

            if (!req.file)
            {
                return res.status(404).send({'message': 'File tiada'});
            }

            const transaction = await DesignLogoModel.sequelize.transaction();


            const data = { 
                "kod_logo" : req.body.kod_logo,
                "keterangan" : req.body.keterangan,
                "id_jenis_logo" :  req.body.id_jenis_logo,
                "id_jenis_sulaman" : req.body.id_jenis_sulaman ,
                "is_aktif": req.body.is_aktif,
                "tarikh_logo": req.body.tarikh_logo,
                "id_syarikat": req.body.id_syarikat,
                "base_warna": req.body.base_warna,
                "id_jenis_kain": req.body.id_jenis_kain,
                "warna_teks": req.body.warna_teks,
                "warna_border": req.body.warna_border,
                "text": req.body.text,
                "font": req.body.font,
                "style": req.body.style,
                "nota": req.body.nota,
                "id_jenis_patch": req.body.id_jenis_patch,

                //Image
                "file_name": req.file.filename,
                "file_path": req.file.destination,
                "file_mimetype": req.file.mimetype,
                "file_original_name": req.file.originalname,
            };


            var logo;
            if (req.body.id_logo)
            {


                var existLogo = await DesignLogoModel.findByPk(req.body.id_logo, {
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                    });


                if(!existLogo)
                {
                    return res.status(404).send({'message': 'Detail logo tidak dijumpai'});
                }

                //Delete existing logo image

                var filePath = process.env.DOCUMENTS+ existLogo.file_path+"/"+existLogo.file_name;


                //Kena tambah logik file wujud ke tak. Pending lagi.

                if (fs.existsSync(filePath)) 
                {
                    //file exists
                    console.log(filePath);
                    fs.unlink(filePath, (err) => {
                        if (err){
                            return res.status(400).send({"message" : "Gagal memadam dokumen. Sila delete Kod Design"});
                        }        
                    });
    
                }
                else
                {
                    console.log("***************************************");
                    console.log("Logo file tak wujud semasa update logo. Upload new image.");
                    console.log("***************************************");
                }



                //Update                
                logo = await existLogo.update(data, {
                    transaction : transaction
                });                

            }
            else
            {
                //Create
                logo = await DesignLogoModel.create(data, {
                    transaction : transaction
                });   


            }

            await transaction.commit();

            return res.status(200).send(logo);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getList(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;
 
            var listLogo = await DesignLogoModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_syarikat', 'DESC']],
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
 
            var detailLogo = await DesignLogoModel.findByPk(req.params.id,{       
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                order : [['id_syarikat', 'DESC']],
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

            });
                            
            if (!detailLogo){
                return res.status(404).send({'message': 'Detail logo tidak dijumpai'});
            }



            return res.status(200).send(detailLogo);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

}

module.exports = Logo;