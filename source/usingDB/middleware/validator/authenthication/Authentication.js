// const PenggunaModel = require("../../models/sequelize/User");
const bcrypt =  require("bcryptjs");

// const { check, validationResult } = require('express-validator/check');
const { check, validationResult } = require('express-validator');


module.exports = { 

 
    validateLogin : [
        check('nama_pengguna')
            .not().isEmpty().withMessage('Nama pengguna diperlukan')
            .custom((value, { req }) => {
                return PenggunaModel.scope(['isActive']).findOne({
                    where : {
                        nama_pengguna : value
                    }
                }).then(user => {
                    if (user == null) {
                        return false;
                    }

                    // Decrypt Check Password
                    var passwordIsValid = bcrypt.compareSync(
                        req.body.password,
                        user.password
                      );
                
                      if (!passwordIsValid) {
                        return false;
                    }


                    var katalaluan = req.body.katalaluan;
                    // var katalaluan = bytes.toString(CryptoJS.enc.Utf8);

                    // if (!Helper.comparePassword(user.katalaluan, katalaluan.toString())) {
                    //     return false;
                    // }
                });
            }).withMessage('Kombinasi nama pengguna dan kata laluan tidak sah'),

        check('katalaluan').not().isEmpty().withMessage('Kata laluan diperlukan')
    ],

    validateForgotPassword : [
        check('emel')
            .not().isEmpty().withMessage('Emel diperlukan')
            .isEmail().withMessage('Emel tidak sah')
            .custom(value => {
                return PenggunaModel.scope(['initTrue', 'active']).findOne({
                    where : {
                        emel : value
                    }
                }).then(user => {
                    if (user == null) {
                        return false;
                    }
                });
            }).withMessage('Emel tidak sah')
    ],

    validateCheckResetPassword : [
        check('token')
            .not().isEmpty().withMessage('Token diperlukan')
            .custom(value => {
                return PenggunaModel.scope(['initTrue', 'active']).findOne({
                    where : {
                        init_str : value
                    }
                }).then(user => {
                    if (user == null) {
                        return false;
                    }
                });
            }).withMessage('Token tidak sah atau sudah tamat tempoh')
    ],

    validateResetPassword : [
        check('token')
            .not().isEmpty().withMessage('Token diperlukan')
            .custom(value => {
                return PenggunaModel.scope(['initTrue', 'active']).findOne({
                    where : {
                        init_str : value
                    }
                }).then(user => {
                    if (user == null) {
                        return false;
                    }
                });
            }).withMessage('Token tidak sah atau sudah tamat tempoh'),

        check('katalaluan_baru')
            .not().isEmpty().withMessage('Kata laluan baru diperlukan')
            .isLength({ min: 6 }).withMessage('Kata laluan baru mesti tidak kurang 6 aksara')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)/).withMessage('Kata laluan mesti mempunyai sekurang-kurangnya satu huruf besar, satu huruf kecil, satu nombor dan tidak boleh mempunyai ruang'),

        check('sah_katalaluan_baru')
            .not().isEmpty().withMessage('Kata laluan diperlukan')
            .custom((value, {req}) => {
                return value == req.body.katalaluan_baru;
            }).withMessage('Kata laluan tidak sah')
    ],

    validateChangePassword : [
        check('katalaluan')
            .not().isEmpty().withMessage('Kata laluan diperlukan')
            .custom((value, { req }) => {
                return PenggunaModel.scope(['initTrue', 'active']).findByPk(req.decoded.id_pengguna).then(user => {
                    if (user == null) {
                        return false;
                    }

                    if (!Helper.comparePassword(user.katalaluan, req.body.katalaluan)) {
                        return false;
                    }
                });
            }).withMessage('Kata laluan tidak sah'),

        check('katalaluan_baru')
            .not().isEmpty().withMessage('Kata laluan baru diperlukan')
            .isLength({ min: 6 }).withMessage('Kata laluan baru mesti tidak kurang 6 aksara')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)/).withMessage('Kata laluan mesti mempunyai sekurang-kurangnya satu huruf besar, satu huruf kecil, satu nombor dan tidak boleh mempunyai ruang'),

        check('sah_katalaluan_baru')
            .not().isEmpty().withMessage('Kata laluan diperlukan')
            .custom((value, {req}) => {
                return value == req.body.katalaluan_baru;
            }).withMessage('Kata laluan tidak sah')
    ]
}