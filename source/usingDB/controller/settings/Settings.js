const SyarikatModel = require("../../models/sequelize/Syarikat");
const KodKeduaModel = require("../../models/sequelize/KodKedua");
const Helper = require("../../controller/Helper");


const PenggunaModel = require("../../models/sequelize/User");
const JenisKerjaModel = require("../../models/sequelize/UserJob");


const { Op } = require("sequelize");
const { moment } = require("moment");
const e = require("express");



const Settings = {

    /**
    * SignUp
    * @param {object} req 
    * @param {object} res
    * @returns {object} user object 
    */
    async createTukang(req, res) {
        try {

            const transaction = await PenggunaModel.sequelize.transaction();

            const dataPengguna = { 
                "nama" : req.body.nama,
                "nama_pengguna" : req.body.nama_pengguna,
                "isActive" : req.body.isActive, 
                "is_pengguna_sistem" : false
            };


            var pengguna; 


            if (req.body.id_pengguna)
            {
                //update
                var existTukang = await PenggunaModel.findByPk(req.body.id_pengguna, {
                    attributes: { 
                        exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                        },
                });

                if(!existTukang)
                {
                    return res.status(404).send({'message': 'Tukang tidak dijumpai'});
                }                


                pengguna = await existTukang.update(dataPengguna, {
                    transaction : transaction
                });      

                //delete roles
                await JenisKerjaModel.destroy({
                    where : {"id_pengguna" : req.body.id_pengguna},
                    force : true,
                    transaction : transaction
                });
            }
            else
            {
                //create
                 pengguna = await PenggunaModel.create(dataPengguna, {
                    transaction : transaction
                });                  
            }


 
            console.log(pengguna);

            if (req.body.roles)
            {
                if (req.body.roles.length>0)
                {
                    var arr_role = [];
                    for (var idrole of req.body.roles)
                    {


                        var dataRole = {
                            "id_job" : idrole,
                            "id_pengguna" : pengguna.id_pengguna
                        }

                        arr_role.push(dataRole);
                    }

                    await JenisKerjaModel.bulkCreate(arr_role, {
                        transaction : transaction
                    });                      

                }  
                
            }

            await transaction.commit();
            return res.status(200).send(pengguna);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async getListTukang(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;
 
            var listTukang = await PenggunaModel.findAndCountAll({
                where : [
                    Helper.filterJoin(req, [
                        {
                            model : PenggunaModel,
                            columnsLike : [
                                'kod_buku',
                                'nama'
                            ]
                        }
                    ]),
                    { 
                        is_pengguna_sistem : false,
                        is_active : true 
                    }           
                ],
                // subQuery: false,
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_pengguna', 'DESC']],
                include : [
                    {                                
                        model : JenisKerjaModel,
                        as : 'Job',
                        required : false,     
                        attributes : ["id_job"], 
                        include : [
                            {                                
                                model : KodKeduaModel,
                                as : 'JenisJob',
                                attributes: ['kod_ref','keterangan']                    
                            },
                        ]       
                    },
                ]


            });
                            
            if (!listTukang){
                return res.status(404).send({'message': 'List tukang tidak dijumpai'});
            }

            return res.status(200).send({
                'totalSize' : listTukang.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : listTukang.rows,
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

module.exports = Settings;