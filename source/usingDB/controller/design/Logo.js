const LogoModel = require("../../models/sequelize/Syarikat");
const Helper = require("../../controller/Helper");
const { Op } = require("sequelize");
const { moment } = require("moment");



const Syarikat = {

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

            const transaction = await SyarikatModel.sequelize.transaction();

            const data = { 
                "kod_syarikat" : req.body.kod_syarikat,
                "nama_syarikat" : req.body.nama_syarikat,
                "id_negeri" :  req.body.id_negeri,
                "id_jenis_perniagaan" : req.body.id_jenis_perniagaan ,
                "is_aktif": req.body.is_aktif 
            };

            const syarikat = await SyarikatModel.create(data, {
                transaction : transaction
            });    

            await transaction.commit();
            return res.status(200).send(syarikat);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getList(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;
 
            var listsyarikat = await SyarikatModel.findAndCountAll({
                subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_syarikat', 'DESC']],

            });
                            
            if (!listsyarikat){
                return res.status(404).send({'message': 'List pindah kayu tidak dijumpai'});
            }

            return res.status(200).send({
                'totalSize' : listsyarikat.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : listsyarikat.rows,
            });


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getDetails(req, res) {
        try {

            var detailSyarikat = await SyarikatModel.findByPk(req.params.id,{
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                }
            });

            if (!detailSyarikat){
                return res.status(404).send({'message': 'Details Syarikat tidak dijumpai'});
            }

            return res.status(200).send(detailSyarikat);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

}

module.exports = Syarikat;