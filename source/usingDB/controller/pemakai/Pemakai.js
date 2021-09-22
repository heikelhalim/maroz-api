const PemakaiModel = require("../../models/sequelize/Pemakai");
const SyarikatModel = require("../../models/sequelize/Syarikat");
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
                "id_syarikat" : req.body.id_syarikat 
            };


            const pemakai = await PemakaiModel.create(data, {
                transaction : transaction
            });    

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

            var where = {};

            if (req.body.id_syarikat)
            {
                where["id_syarikat"] = req.body.id_syarikat;
            }
 
            var listpemakai = await PemakaiModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                where : where,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_pemakai', 'DESC']],
                include : [
                    {                                
                        model : SyarikatModel,
                        as : 'Syarikat',
                        attributes: ['nama_syarikat','kod_syarikat']                    
                    },
                    
                ] 

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

}

module.exports = Pemakai;