const jwt = require("jsonwebtoken");
const moment = require("moment");


const Auth = {

    /**
     * Verify token
     * @param {object} req 
     * @param {object} res
     * @returns {object} user object 
     */
    async verifyToken(req, res, next){
        var token = req.headers['x-access-token'];
        var userinfo = false;

        if (token && token != '') {
            try {
                // verifies secret and checks exp
                jwt.verify(token, process.env.SECRET, function(err, decoded) {
                    if (err) {
                        return res.status(401).json({"error": true, "message": 'Unauthorized access.' });
                    }

                    var expDate = moment(decoded.exp * 1000).format('llll');
                    var oneHourBeforeExp = moment(decoded.exp * 1000).subtract(1, 'hours');

                    if (moment() > moment(oneHourBeforeExp)){
                        // Todo refresh token
                        // return res.status(200).json({
                        //     token : token,
                        //     decoded : decoded,
                        //     date : moment().format('llll'),
                        //     origin : expDate,
                        //     then : moment(oneHourBeforeExp).format('llll')
                        // });
                    }

                    req.decoded = decoded;
                    next();
                });
            } catch (error){
                return res.status(400).send(error);
            }
        } else {
            // if there is no token
            // return an error
            return res.status(403).send({
                "error": true,
                "message": 'No token provided.'
            });
        }
    }
}

// export default Auth;

module.exports = Auth;
