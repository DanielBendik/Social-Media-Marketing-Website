const mysql = require('mysql2/promise')

String.prototype.ssplit = function(sep, maxsplit) {
    let str = this;
    let s = str.split(sep);
    let rem = s.splice(0, maxsplit);
    rem.push(s.join(sep))
    return rem;
}

const pool = mysql.createPool({
    host: 'exbodcemtop76rnz.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: '00000000000',       // hidden for privacy
    password: '00000000000',   // hidden for privacy
    database: '00000000000',   // hidden for privacy
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    decimalNumbers: true
});

module.exports = pool

pool.on('connection', function(connection) {
    console.log('Connected to MySQL2 DB');
});

pool.on('error', function(err) {
    console.error('Connection to MySQL2 DB failed');
});
