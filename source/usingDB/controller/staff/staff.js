const StaffModel = require("../../models/sequelize/User");
const UserJobModel = require("../../models/sequelize/UserJob");
const KodKeduaModel = require("../../models/sequelize/KodKedua");

const Helper = require("../../controller/Helper");
const { Op } = require("sequelize");
const { moment } = require("moment");



const Staff = {

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

module.exports = Staff;