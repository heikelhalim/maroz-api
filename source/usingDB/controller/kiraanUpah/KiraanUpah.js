const KadarUpahModel = require("../../models/sequelize/KadarUpah");
const PenggunaModel = require("../../models/sequelize/User")
const KontrakModel = require("../../models/sequelize/Kontrak");


const KodKeduaModel = require("../../models/sequelize/KodKedua");
const Helper = require("../Helper");
const { Op } = require("sequelize");
const { moment } = require("moment");



const KadarUpah = {


    async getList(req, res) {
        try {

            const pageSize = req.body.sizePerPage || 10;
            const page = req.body.page || 1;
 
            var body = req.body


            //status kontrak
            var kod_kerja = ["potong","jahit","butang","sulam"];
            
            var kod_kedua = {
                potong : "PTG",
                jahit : "JHT",
                butang : "BTG",
                sulam : "SLM"
            };


            var kod_status_kod = "";
            var arr_status_cnt = [];

            for (var item of kod_kerja){  
                var status_count = {};
                switch(item) {
                    case "potong":
                        kod_status_kod = kod_kedua.potong; 
                        break;
                    case "jahit":             
                        kod_status_kod = kod_kedua.jahit;  
                        break;
                    case "butang":
                        kod_status_kod = kod_kedua.butang;  
                        break;
                    case "sulam":
                        kod_status_kod = kod_kedua.sulam;  
                }

                const showStatus = await KadarUpahModel.count({
                    include: [
                        {
                            model : KodKeduaModel,
                            as : 'JenisKerja',
                            required : true,
                            where : {
                                kod_ref : kod_status_kod
                            },
                        },
                    ]
                });
                status_count["jenis_kerja"] = item;
                status_count["cnt"] = showStatus;
                arr_status_cnt.push(status_count);
            }  


            var condition = {};

            if (body.jenis_kerja)
            {                
                var kod_status;      
            
                switch(body.jenis_kerja) {
                    case "potong":
                        kod_status = kod_kedua.potong; 
                        break;
                    case "jahit":             
                        kod_status = kod_kedua.jahit;  
                        break;
                    case "butang":
                        kod_status = kod_kedua.butang;  
                        break;
                    case "sulam":
                        kod_status = kod_kedua.sulam;  
                }
                
                condition = {
                    'kod_ref' : kod_status ,
                    'is_aktif' : true
                };

            }

            var kadarUpahList = await KadarUpahModel.findAndCountAll({
                where : Helper.filterJoin(req, [
                    {
                        model : PenggunaModel,
                        columnsLike : [
                            'nama',
                        ],
                        columnsEqual : ['id_pengguna'],
                        joinAlias : 'Tukang'
                    },
                ], true),
                subQuery: false, 
                distinct : true,
                attributes: { 
                             exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                },
                limit : pageSize, 
                offset : Helper.offset(page, pageSize),    
                order : [['id_kadar_upah', 'DESC']],
                include : [
                    {                                
                        model : KontrakModel,
                        as : 'Kontrak',
                        required : true,
                        attributes: ['id_kontrak','kod_kontrak','tajuk_ringkas']                   
                    },
                    {                                
                        model : PenggunaModel,
                        as : 'Tukang',
                        required : true,
                        attributes: ['nama']                   
                    },                    
                    {
                        model : KodKeduaModel,
                        as : 'JenisKerja',
                        required : true,
                        where : condition,
                        attributes: ['kod_ref','keterangan']     
                    },                    
                ]

            });
                            
            if (!kadarUpahList){
                return res.status(404).send({'message': 'List tidak dijumpai'});
            }

            return res.status(200).send({
                'jenis_kerja_list' : arr_status_cnt,
                'totalSize' : kadarUpahList.count,
                'sizePerPage' : pageSize,
                'page' : page,
                'data' : kadarUpahList.rows,
            });


            }catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    async updateKiraanUpah(req, res) {
        try {
            
            const transaction = await KadarUpahModel.sequelize.transaction();

            var existKadarUpah = await KadarUpahModel.findByPk(req.body.id_kadar_upah, {
                attributes: { 
                    exclude: ['created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by']
                    },
                });


            if(!existKadarUpah)
            {
                return res.status(404).send({'message': 'Detail Kadar Upah tidak dijumpai'});
            }


            const data = {
                "kadar_upah" : req.body.kadar_upah
            }

            var kadarUpah = await existKadarUpah.update(data, {
                transaction : transaction
            }); 

            await transaction.commit();

            return res.status(200).send(kadarUpah);

        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    }
}

module.exports = KadarUpah;