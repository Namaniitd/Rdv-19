/**
 *Sunil and Manish
 */

let utils = require('../utils');
let jwt = require('jsonwebtoken');
let qrimage = require('qr-image');
let fs = require('fs');
let crypto = require('crypto');
const secret = require('../secrets');

//let hummus = require('hummus');

let inviteMailer = require('../mailers/inviteMailer');

let dynamoDB = utils.connectToDB();
let tableName = '2019_RDV_Registrations';

function invite(req, res) {
  let token = req.query.token;
  let pronite = req.query.pronite;
  let email = req.query.email.toLowerCase();

  if (!token || !pronite || !email)
    return utils.error(res, 400, "Bad Request");

  if (!email.match(/^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/))
    return utils.error(res, 400, "Please enter a valid Email Address");

  jwt.verify(token, secret.encry, function(err, user) {
    if (err)
      return utils.error(res, 401, "Invalid Token");
    dynamoDB.get(params("rdv_number", user.rdv_number), function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        if (!data.Item)
          return utils.error(res, 401, "Invalid Token");
        delete data.Item['password'];

        sendInvite(req, res, email, data.Item, pronite);
      }
    })
  });
}

function sendInvite(req, res, email, user, pronite) {
  if (!user[pronite] || !user[pronite].startsWith("Invitees"))
    return utils.error(res, 401, "You cannot send invites for this Pronite!");

  const inviteString = user[pronite];
  const totalInvites = parseInt(inviteString.split(' ')[1]);
  const sentInvites = parseInt(inviteString.split(' ')[2]);

  let splitInviteString = inviteString.split(' ');

  if (sentInvites >= totalInvites)
    return utils.error(res, 401, "You have exhausted your invites for this Pronite!");

  let qr = user.rdv_number + "-" + pronite + "-" + (sentInvites + 1);
  //@recheck if need to change
  const secretKey = "%%Wubba%Lubba%Dub%Dub%%";
  qr += ";" + crypto.createHash('md5').update(qr + secretKey).digest('hex');

  inviteMailer.sendMail(email, user, pronite, qr, () => {
    splitInviteString[2] = '' + (sentInvites +1);
    const newInviteString = splitInviteString.join(' ');
    let inviteParams = {
      TableName: tableName,
      Key: {
        'rdv_number': user.rdv_number
      },
      UpdateExpression: 'SET ' + pronite + ' = :value',
      ExpressionAttributeValues: {
        ':value': newInviteString
      }
    };

    dynamoDB.update(inviteParams, function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        return res.json({
          error: false,
          message: 'Invitation sent successfully! If your invitee doesn\'t receive a mail, you can send them the following link: https://rdviitd.org/api/invitee-pdf?qr=' + qr
        });
      }
    });
  });
}

function getInviteePDF(req, res) {
  const qr = req.query.qr;

  if (!qr)
    return utils.error(res, 400, "Bad Request");

  const splitQR = qr.split(';');
  const secretKey = "%%Wubba%Lubba%Dub%Dub%%";
  if (crypto.createHash('md5').update(splitQR[0] + secretKey).digest('hex') !== splitQR[1])
    return utils.error(res, 400, "Invalid QR");

  const rdvNumber = qr.split('-')[0];
  const pronite = qr.split('-')[1];

  dynamoDB.get(params("rdv_number", rdvNumber), function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (!data.Item)
        return utils.error(res, 400, "Invalid QR");
      delete data.Item['password'];

      makeInviteePDF(req, res, data.Item, pronite, qr);
    }
  });
}

function makeInviteePDF(req, res, user, pronite, qr) {
  let qr_svg = qrimage.image(qr, { type: 'png', margin: 1, size: 4 });
  let stream = fs.createWriteStream(user.rdv_number + '.png');

  qr_svg.on('end', function () {
    this.emit('close');
    stream.end();
  });

  stream.on('close', function () {

    let tempFile = "passes/" + pronite + ".pdf";
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=' + user.rdv_number + '_' + pronite + '.pdf'
    });
    let writer = hummus.createWriterToModify(new hummus.PDFRStreamForFile(tempFile), new hummus.PDFStreamForResponse(res));

    let pageModifier = new hummus.PDFPageModifier(writer,0, true);
    pageModifier.startContext().getContext().drawImage(227, 518, user.rdv_number + '.png');
    pageModifier.getContext().writeText(user.first_name + " " + user.last_name, 426, 594, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:16,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText(user.rdv_number, 464, 575, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:16,colorspace:'gray',color:0x00});

    pageModifier.getContext().writeText("ADMIT ONE", 239, 675, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:30,colorspace:'gray',color:0x00});

    pageModifier.getContext().writeText("TEAM", 125, 445, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});
    pageModifier.getContext().writeText("INVITEE", 110, 405, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});

    pageModifier.getContext().writeText("Please Do Not Forget:", 90, 340, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:15,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- This ticket allows only ONE person and is valid only for RDV Invitees.", 95, 320, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Please bring a printout / show on mobile phone when you come for entry to pronite.", 95, 305, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Entry to OAT will take place from Faculty/Girls entry point through Nalanda Ground.", 95, 290, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Entry to Open Air Theatre (OAT) will be allowed only till 6:30 pm in the evening.", 95, 275, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Rendezvous reserves the right to deny entry to any candidate.", 95, 260, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Duplication or digital modification of this ticket will prevent you from being admitted.", 95, 245, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Any person with alcohol, cigarettes or other substance abuse will be penalised with disciplinary action.", 95, 230, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Carry-on items like shoulder bags, laptop bags, briefcases are not allowed in any case.", 95, 215, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Water bottles and food items are not allowed inside the Open Air Theatre (OAT).", 95, 200, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Children below the age of 12 are restricted to attend the pronite for security reasons.", 95, 185, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Parking inside the campus will be chargeable at Rs.300/-.", 95, 170, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});

    pageModifier.endContext().writePage();
    writer.end();
    fs.unlinkSync(user.rdv_number + '.png');
    res.end();
  });

  qr_svg.pipe(stream);
}

function getSponsorPDF(req, res) {
  let token = req.query.token;
  let pronite = req.query.pronite;

  if (!token || !pronite)
    return utils.error(res, 400, "Bad Request");

  jwt.verify(token, '##Nikhil%Was%Here##', function(err, user) {
    if (err)
      return utils.error(res, 401, "Invalid Token");
    dynamoDB.get(params("rdv_number", user.rdv_number), function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        if (!data.Item)
          return utils.error(res, 401, "Invalid Token");
        delete data.Item['password'];

        makeSponsorPDF(req, res, data.Item, pronite);
      }
    })
  });
}

function makeSponsorPDF(req, res, user, pronite) {
  let bookString = user[pronite];

  if (!bookString)
    return utils.error(res, 401, "No Booking Found!");

  if (!bookString.startsWith("Sponsor"))
    return utils.error(res, 401, "Invalid PDF Generation");

  let numPasses = bookString.split(' ')[1];

  let QRstring = user.rdv_number + "-" + pronite;
  let secretKey = "%%Wubba%Lubba%Dub%Dub%%";
  QRstring += ";" + crypto.createHash('md5').update(QRstring + secretKey).digest('hex');

  let qr_svg = qrimage.image(QRstring, { type: 'png', margin: 1, size: 4 });
  let stream = fs.createWriteStream(user.rdv_number + '.png');

  qr_svg.on('end', function () {
    this.emit('close');
    stream.end();
  });

  stream.on('close', function () {

    let tempFile = "passes/" + pronite + ".pdf";
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=' + user.rdv_number + '_' + pronite + '.pdf'
    });
    let writer = hummus.createWriterToModify(new hummus.PDFRStreamForFile(tempFile), new hummus.PDFStreamForResponse(res));

    let pageModifier = new hummus.PDFPageModifier(writer,0, true);
    pageModifier.startContext().getContext().drawImage(227, 518, user.rdv_number + '.png');
    pageModifier.getContext().writeText(user.first_name + " " + user.last_name, 426, 594, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:16,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText(user.rdv_number, 464, 575, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:16,colorspace:'gray',color:0x00});

    pageModifier.getContext().writeText("ADMIT MANY", 230, 675, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:30,colorspace:'gray',color:0x00});

    pageModifier.getContext().writeText("RDV", 145, 445, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});
    pageModifier.getContext().writeText("SPONSOR", 95, 405, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});

    pageModifier.getContext().writeText("Please Do Not Forget:", 90, 325, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:15,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- This ticket allows multiple and is valid only for RDV Sponsors.", 95, 305, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Only one person will be allowed on one successful scan.", 95, 290, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Entry to Open Air Theatre (OAT) will be allowed only till 6:30 pm in the evening.", 95, 275, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Rendezvous reserves the right to deny entry to any candidate.", 95, 260, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Duplication or digital modification of this ticket will prevent you from being admitted.", 95, 245, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Any person with alcohol, cigarettes or other substance abuse will be penalised with disciplinary action.", 95, 230, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Carry-on items like shoulder bags, laptop bags, briefcases are not allowed in any case.", 95, 215, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Water bottles and food items are not allowed inside the Open Air Theatre (OAT).", 95, 200, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Children below the age of 12 are restricted to attend the pronite for security reasons.", 95, 185, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- Parking inside the campus will be chargeable at Rs.300/-.", 95, 170, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});

    pageModifier.endContext().writePage();
    writer.end();
    fs.unlinkSync(user.rdv_number + '.png');
    res.end();
  });

  qr_svg.pipe(stream);
}

module.exports = {
  invite: invite,
  getInviteePDF: getInviteePDF,
  getSponsorPDF: getSponsorPDF,
};

function params (key, id) {
  if (key == 'rdv_number') {
    return {
      TableName: '2017_RDV_Registrations',
      Key: {
        rdv_number: id
      }
    }
  } else {
    return {
      TableName: '2017_RDV_Registrations',
      IndexName: 'email',
      KeyConditionExpression: 'email = :value',
      ExpressionAttributeValues: {
        ':value': id
      }
    }
  }
}
