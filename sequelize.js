const Sequelize = require('sequelize');
// var Client = require('ssh2').Client;

// connection
var sequelizeConn = new Sequelize(process.env.DATABASE_URL, {
    operatorsAliases: false,  
//    port : '5433', //allow this if you use ssh-tunnel (only for local use dont push this to server)
    pool: {
        max: 5, 
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+08:00'   
});  
 
/** 
* This is ssh-tunnel function. Only enable for local use only
* Dont push any changers here. Please git ignored this file
*/

/* shh-tunnel start */
// var config = {        
//     user:'heikel', // remote server username  
//     passphrase:'mikeltest88', // remote server password
//     host:'34.87.46.209', // remote server ip
//     port:22, // remote server port
//     dstHost:'35.198.239.184', // databse server ip    
//     dstPort:5432, // datebase server port
//     localHost:'127.0.0.1', // local ip (will be use at env DATABASE_URL settings)
//     localPort:5433, // local port make sure this port is not conflict with others port
//     privateKey:require('fs').readFileSync('/home/heikel/.ssh/id_rsa'), // your public key location
//     keepAlive: true // option in the configuration !
// };

// var tunnel = require('tunnel-ssh'); 

// var server = tunnel(config, function (error, server) { 
//     if(error) {     
//         console.error(error);   
//     } else {     
//         console.log('server:', server);
 
//         // test sequelize connection     
//         sequelizeConn.authenticate().then(function(err) {
//             console.log('connection established');         
//         }).catch(function(err) {             
//             console.error('unable establish connection', err);         
//         });
//     } 
// });

// server.on('error', function(err) {
//     console.error('unable establish server', err);
// });
/* shh-tunnel end */

module.exports = {
    sequelizeConn
}