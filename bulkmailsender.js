var mailer  = require("./mailers/inviteMailer");
const delay = require('delay');
// var fs = require("fs")
// mailer.sendMail("rudrakshgupta.1998@gmail.com")

var fs = require('fs'),
    readline = require('readline');

var rd = readline.createInterface({
    input: fs.createReadStream('./reg_dump_1.txt'),
    output: process.stdout,
    console: false
});

rd.on('line', function(line) {
    // console.log(line);
     // delay(10000);
    mailer.sendMail(line)
});