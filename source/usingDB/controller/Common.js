const KodKeduaModel = require("../models/sequelize/KodKedua");
const KodUtamaModel = require("../models/sequelize/KodUtama");
const Helper = require("../controller/Helper");
const { Op } = require("sequelize");
const { moment } = require("moment");


const path = require("path");
const mime = require("mime"); 

const { check, validationResult } = require('express-validator');

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
 
        /**
     * Upload function
     * @param {object} req
     * @param {object} res
     * @returns {object}  upload info array
     */
    async upload(req, res){

            try {
                var successFile = [];


                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array() });
                }


                // if (req.hasOwnProperty("files") && Object.keys(req.files).length){
    
                //     var path = 'upload/';
                //     var dir = process.env.DOCUMENTS+path;
    
                //     console.log("LAAAAAA");

                //     for (var i in req.files){

                //         console.log(req);

                //         req.checkBody(i).checkFileExtension(req.files[i].name, ['.txt', '.pdf', '.png', '.jpg']).withMessage('Fail tidak mengikut format');
                //         req.checkBody(i).checkFileSize(req.files[i].size, (500 * 1024)).withMessage('Size fail melebihi 500 kb');
    
                //         let error = req.validationErrors(true);
    
                //         console.log("ETASDASD");

                //         if (!error.hasOwnProperty(i)){


                //             console.log("FILE ADA");
                            
                //             let file = req.files[i];
                //             var newFileName = Helper.random()+"_"+file.name.replace(/\s/g,'');
    
                //             file.mv(dir+newFileName, function(err) {
                //                 if (err){
                //                 return res.status(500).send(err);
                //                 }
                //             });
    
                //             successFile.push({
                //                 "param" : i,
                //                 "file_name" : file.name,
                //                 "new_file_name" : newFileName,
                //                 "path" : path+newFileName
                //             });
                //         }
                //     }
                // }
    
                return res.status(200).send({
                    "success_file" : successFile,
                    // "errors" : req.validationErrors()
                });
            } catch (error){
                console.log(error);
                return res.status(400).send(error);
            }
    },

}

module.exports = Common;