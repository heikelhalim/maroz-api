const SyarikatModel = require("../../models/sequelize/Syarikat");
const KodKeduaModel = require("../../models/sequelize/KodKedua");
const Helper = require("../../controller/Helper");
const KontrakModel = require("../../models/sequelize/Kontrak");

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
                "alamat1" : req.body.alamat1,
                "alamat2" : req.body.alamat2,
                "alamat3" : req.body.alamat3,
                "poskod" : req.body.poskod,
                "daerah" : req.body.daerah,
                "id_negeri" :  req.body.id_negeri,
                "emel" : req.body.emel,
                "no_telefon" : req.body.no_telefon,
                "no_faks" : req.body.no_faks,
                "id_jenis_perniagaan" : req.body.id_jenis_perniagaan ,
                "is_aktif": req.body.is_aktif
            };


            var syarikat;
            if (req.body.id_syarikat)
            {
                //Update

                var existSyarikat = await SyarikatModel.findByPk(req.body.id_syarikat, {
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                    });


                if(!existSyarikat)
                {
                    return res.status(404).send({'message': 'Detail syarikat tidak dijumpai'});
                }

                
                syarikat = await existSyarikat.update(data, {
                    transaction : transaction
                }); 


            }
            else
            {
                //Create
                syarikat = await SyarikatModel.create(data, {
                    transaction : transaction
                });    
    


            }


             
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
                where : Helper.filterJoin(req, [
                    {
                        model : SyarikatModel,
                        columnsLike : [
                            'nama_syarikat',
                            'kod_syarikat'
                        ]
                    },
                ], true),
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
                        model : KontrakModel,
                        as : 'CheckKontrak',
                        required : false,     
                        limit : 1         
                    },
                ]

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
                },
                include : [
                    {                                
                        model : KodKeduaModel,
                        as : 'Negeri',
                        attributes: ['kod_ref','keterangan']                    
                    },
                    {                                
                        model : KodKeduaModel,
                        as : 'JenisPerniagaan',
                        attributes: ['kod_ref','keterangan']                   
                    },
                ]
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
    
    async delete(req, res) {
        try {

            const transaction = await SyarikatModel.sequelize.transaction();

            //Delete 
            const delSykt = await SyarikatModel.destroy({
                where : {
                    "id_syarikat" : req.params.id
                },
                force : true,
                transaction : transaction
            });
                

            await transaction.commit();
            return res.status(200).send({ status : "delete" });
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },


}

module.exports = Syarikat;