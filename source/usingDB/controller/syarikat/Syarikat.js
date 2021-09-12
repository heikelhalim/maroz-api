const SyarikatModel = require("../../models/sequelize/Syarikat");


// import CryptoJS from 'crypto-js';
// import jwt from 'jsonwebtoken';
// import bcrypt  from 'bcryptjs';
// import Helper from '../Helper';
// import seqlib from 'sequelize';
// import uuidv4 from 'uuid/v4';
// import moment from 'moment';

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
                "email" : req.body.email,
                "nama_pengguna" : req.body.nama_pengguna,
                "katalaluan" :  bcrypt.hashSync(req.body.katalaluan, 8),
                "isActive" : req.body.isActive 
            };

            const pengguna = await PenggunaModel.create(dataPengguna, {
                transaction : transaction
            });    


            if (!req.body.nama_pengguna || !req.body.katalaluan) {
                return res.status(400).send({'message': 'Some values are missing'});
            }

            await transaction.commit();
            return res.status(200).send(pengguna);
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

}


module.exports = Syarikat;