const KodKeduaModel = require("../models/sequelize/KodKedua");
const KodUtamaModel = require("../models/sequelize/KodUtama");
const Helper = require("../controller/Helper");
const { Op } = require("sequelize");
const { moment } = require("moment");



const Common = {


    async getDropDown(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;
 
            var listdropdown = await KodKeduaModel.scope(['checkActive']).findAll({
                attributes: ['id_kod_kedua','kod_ref','keterangan','catatan'],
                order : [['id_kod_kedua', 'DESC']],
                include : [
                    {                                
                        model : KodUtamaModel,
                        as : 'KodUtama',
                        required : true,
                        where : { nama : req.params.id },
                        attributes: ['nama']                    }
                ]

            });
                            
            if (!listdropdown){
                return res.status(404).send({'message': 'List pindah kayu tidak dijumpai'});
            }

            return res.status(200).send(listdropdown);

            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

}

module.exports = Common;