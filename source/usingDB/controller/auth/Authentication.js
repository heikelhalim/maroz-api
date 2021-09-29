const PenggunaModel = require("../../models/sequelize/User");
const UserRoleModel = require("../../models/sequelize/UserRole");
const RoleModel = require("../../models/sequelize/Role");
const RolePermissionModel = require("../../models/sequelize/RolePermission");
const PageModel = require("../../models/sequelize/Page");



const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// import CryptoJS from 'crypto-js';
// import jwt from 'jsonwebtoken';
// import bcrypt  from 'bcryptjs';
// import Helper from '../Helper';
// import seqlib from 'sequelize';
// import uuidv4 from 'uuid/v4';
// import moment from 'moment';

const Authentication = {

    /**
     * SignUp
     * @param {object} req 
     * @param {object} res
     * @returns {object} user object 
     */
     async signup(req, res) {
        try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
            // const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     return res.status(422).json({ errors: errors.array() });
            // }

            const transaction = await PenggunaModel.sequelize.transaction();

            const dataPengguna = { 
                "nama" : req.body.nama,
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



    /**
     * Login
     * @param {object} req 
     * @param {object} res
     * @returns {object} user object 
     */
    async login(req, res) {
        try {
            if (!req.body.nama_pengguna || !req.body.katalaluan) {
                return res.status(400).send({'message': 'Some values are missing'});
            }

            
            const pengguna = await PenggunaModel.scope(['checkActive']).findOne({
                where : { nama_pengguna : req.body.nama_pengguna },
                include : [
                    {                                
                        model : UserRoleModel,
                        as : 'Role',
                        attributes: ['id_role'],
                        include : [
                            {
                                model : RoleModel,
                                as : 'JenisRole',
                                attributes: ['nama'],
                                include : [
                                    {
                                        model : RolePermissionModel,
                                        as : 'Permission',
                                        attributes: ['id_role_permission'],
                                        include : [
                                            {
                                                model : PageModel,
                                                as : 'Page',
                                                attributes: ['name'],
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]                    
                    },
                ]

            });


            if (!pengguna) {
                return res.status(400).send({'message': 'Tiada pengguna dijumpai'});
            }


            //Loop Permission Page

            var permissionLog = [];
            var roleLog = "";

            if (pengguna.Role)
            {
                roleLog =pengguna.Role.JenisRole.nama;

                for( var permission of pengguna.Role.JenisRole.Permission)
                {
                    permissionLog.push(permission.Page.name);
                }
            }

            // console.log(pengguna.Role.id_role);

            //Check password
            var passwordIsValid = bcrypt.compareSync(
                req.body.katalaluan,
                pengguna.katalaluan
              );
        
              if (!passwordIsValid) {
                return res.status(401).send({
                  accessToken: null,
                  message: "Invalid Password!"
                });
              }


            var token = jwt.sign({ 
                id: pengguna.id_pengguna,
                role : roleLog,
                permission : permissionLog
            }, process.env.SECRET, {
                expiresIn: 86400 // 24 hours
            });
        

            return res.status(200).send({ token });
        } catch(error) {
            console.log(error);
            return res.status(400).send(error);
        }
    },

    /*
    * logout
    */
    async logout(req, res){
        // to do logout process
        const authHeader = req.headers["authorization"];
        
        jwt.sign(authHeader, "", { expiresIn: 1 } , (logout, err) => {
            if (logout) {
            res.send({msg : 'You have been Logged Out' });
            } else {
            res.send({msg:'Error'});
            }
        });

        return res.status(200).send({
            "info" : req.decoded,
            "logout" : true 
        });
    },

    /**
     * Check Reset Password
     * @param {object} req 
     * @param {object} res
     * @returns {object} user object 
     */
    async checkUserType(req, res) {
        try {
            const Op = seqlib.Op;

            const pengguna = await PenggunaModel.scope(['initTrue', 'active']).findByPk(req.decoded.id_pengguna, {
                include : [
                    {
                        model : StafModel,
                        as : 'Staf',
                        include : [
                            {
                                model : PerananPenggunaModel,
                                as : 'PerananPengguna',
                                attributes : ['id_peranan'],
                                include : [
                                    {
                                        model : KodStandardKeduaModel,
                                        as : 'Peranan',
                                        attributes : [['keterangan_bm', 'label']]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            const mohonAktiviti = await MohonAktivitiModel.findOne({
                where : {
                    id_pengguna : req.decoded.id_pengguna,
                    // id_keputusan_pelulus : 10961,
                    tarikh_lulus : {
                        [Op.not] : null,
                        [Op.lte] : moment(new Date())
                    }
                },
                include : [
                    {
                        model : KodStandardKeduaModel,
                        as : 'KeputusanPelulus',
                        where : {
                            kod : 'L'
                        },
                        required : true,
                        attributes : [['keterangan_bm', 'label']],
                        include : [
                            {
                                model : KodStandardUtamaModel,
                                as : 'KodUtama',
                                where : {
                                    nama : 'ref_status_lulus'
                                },
                                required : true,
                            }
                        ]
                    },
                    {
                        model : MohonAktivitiSubModel,
                        as : 'MohonAktivitiSub',
                        required : true,
                        where : {
                            tarikh_tamat : {
                                [Op.not] : null,
                                [Op.gte] : moment(new Date())
                            },
                        },
                        include : [
                            {
                                model : KodStandardKeduaModel,
                                as : 'Aktiviti',
                                attributes : [['keterangan_bm', 'label'], 'kod']
                            }, 
                            {
                                model : KodStandardKeduaModel,
                                as : 'TempohPendaftaran',
                                attributes : [['keterangan_bm', 'label']]
                            }
                        ]
                    }
                ],
                order : [['id_mohon_aktiviti', 'DESC']]
            });

            const checkAktiviti = await MohonAktivitiModel.findOne({
                where : {
                    id_pengguna : req.decoded.id_pengguna
                }
            });

            // check user type
            var userType = 1; // User 1st Login
            if (mohonAktiviti){ // Pelanggan (Active User)
                userType = 4;
            } else if (checkAktiviti){ // Basic User + activiti
                userType = 3;
            } else if (pengguna.last_login != null){ // Basic User
                userType = 2;
            }

            return res.status(200).send({
                user_type : userType
            });
        } catch(error) {
            return res.status(400).send(error);
        }
    },

    /**
     * Forgot Password
     * @param {object} req 
     * @param {object} res
     * @returns {object} user object 
     */
    async forgotPassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            if (!req.body.emel) {
                return res.status(400).send({'message': 'Some values are missing'});
            }

            if (!Helper.isValidEmail(req.body.emel)) {
                return res.status(400).send({ 'message': 'Please enter a valid emel address' });
            }

            const pengguna = await PenggunaModel.scope(['initTrue', 'active']).findOne({
                where : {
                    emel : req.body.emel
                }
            });

            if (!pengguna) {
                return res.status(400).send({'message': 'Emel tidak sah'});
            }

            // const randomPassword = Helper.random();
            // const hashPassword = Helper.hashPassword(randomPassword);
            const init_str = Helper.generateToken(req.body.emel);

            pengguna.update({
                init_str : init_str
            });

            var template = '<p style="line-height:1.2em;font-weight:bold;font-size:1.2rem">';
            template += 'Penetapan Semula Kata Laluan iTimber';
            template += '</p>';
            template += '<p style="line-height:1.2em;margin:0;">Tekan butang reset kata laluan untuk tetapkan semula kata laluan iTimber anda</p>';
            template += '<div>';
            template += '<a style="border-radius:10px;margin:auto;padding:10px;width:200px;display:block;background:#00bfa5;color:#fff;text-transform:uppercase;text-decoration:none;margin-top:50px;" href="'+process.env.FRONT_END_URL+'/reset-password?token='+init_str+'">';
            template += 'Reset Kata Laluan';
            template += '</a>';
            template += '<p>Terima Kasih</p>';
            template += '</div>';

            //email
            const sendmail = Helper.sendmail({
                "emel" : pengguna.emel,
                "subject" : "Penetapan Semula Kata Laluan iTimber",
                "html" : template
            });

            return res.status(200).send({
                "success" : true,
                "init_str" : init_str
            });
        } catch(error) {
            return res.status(400).send(error);
        }
    },

    /**
     * Check Reset Password
     * @param {object} req 
     * @param {object} res
     * @returns {object} user object 
     */
    async checkResetPassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            return res.status(200).send(true);
        } catch(error) {
            return res.status(400).send(error);
        }
    },

    /**
     * Reset Password
     * @param {object} req 
     * @param {object} res
     * @returns {object} user object 
     */
    async resetPassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            const pengguna = await PenggunaModel.scope(['initTrue', 'active']).findOne({
                where : {
                    init_str : req.body.token
                }
            });

            if (!pengguna) {
                return res.status(400).send({'message': 'Pengguna tidak dijumpai'});
            }

            const hashPassword = Helper.hashPassword(req.body.katalaluan_baru);
            
            pengguna.update({
                katalaluan : hashPassword,
                init_str : null
            });

            var template = '<p style="line-height:1.2em;font-weight:bold;font-size:1.2rem">';
            template += 'Penetapan Semula Kata Laluan iTimber';
            template += '</p>';
            template += '<p style="line-height:1.2em;margin:0;"><strong>' + pengguna.nama + '</strong></p>';
            template += '<p style="line-height:1.2em;margin:0;">Kata laluan ditetapkan semula</p>';
            template += '<p style="line-height:1.2em;margin:0;">Sila guna ID dan kata laluan berikut</p>';
            template += '<p style="line-height:1.2em;margin:0;"><strong>ID : ' + pengguna.nama_pengguna + '</strong></p>';
            template += '<p style="line-height:1.2em;margin:0;"><strong>Kata laluan : ' + req.body.katalaluan_baru + '</strong></p>';
            template += '<div>';
            template += '<p>Terima Kasih</p>';
            template += '</div>';

            //email
            const sendmail = Helper.sendmail({
                "emel" : pengguna.emel,
                "subject" : "Penetapan Semula Kata Laluan iTimber",
                "html" : template
            });

            return res.status(200).send({
                "success" : true,
                "new_password" : req.body.katalaluan_baru 
            });
        } catch(error) {
            return res.status(400).send(error);
        }
    },

    /**
     * Change Password
     * @param {object} req 
     * @param {object} res
     * @returns {object} user object 
     */
    async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            if (!req.body.katalaluan || !req.body.katalaluan_baru) {
                return res.status(400).send({'message': 'Some values are missing'});
            }

            const pengguna = await PenggunaModel.scope(['initTrue', 'active']).findByPk(req.decoded.id_pengguna);

            if (!pengguna) {
                return res.status(400).send({'message': 'Pengguna tidak dijumpai'});
            }

            if(!Helper.comparePassword(pengguna.katalaluan, req.body.katalaluan)) {
                return res.status(400).send({ 'message': 'Katalaluan tidak sah' });
            }

            const hashPassword = Helper.hashPassword(req.body.katalaluan_baru);
            
            pengguna.update({
                katalaluan : hashPassword
            });

            var template = '<p style="line-height:1.2em;font-weight:bold;font-size:1.2rem">';
            template += 'Penetapan Semula Kata Laluan iTimber';
            template += '</p>';
            template += '<p style="line-height:1.2em;margin:0;"><strong>' + pengguna.nama + '</strong></p>';
            template += '<p style="line-height:1.2em;margin:0;">Kata laluan ditetapkan semula</p>';
            template += '<p style="line-height:1.2em;margin:0;">Sila guna ID dan kata laluan berikut</p>';
            template += '<p style="line-height:1.2em;margin:0;"><strong>ID : ' + pengguna.nama_pengguna + '</strong></p>';
            template += '<p style="line-height:1.2em;margin:0;"><strong>Kata laluan : ' + req.body.katalaluan_baru + '</strong></p>';
            template += '<div>';
            template += '<p>Terima Kasih</p>';
            template += '</div>';

            //email
            const sendmail = Helper.sendmail({
                "emel" : pengguna.emel,
                "subject" : "Penetapan Semula Kata Laluan iTimber",
                "html" : template
            });

            return res.status(200).send({
                "success" : true,
                "new_password" : req.body.katalaluan_baru 
            });
        } catch(error) {
            return res.status(400).send(error);
        }
    }
}

// export default Authentication;

module.exports = Authentication;