/**
 * Created by Sunil
 */

//***************CONFIRM PERIOD CONFIG*****************//

let startTime = new Date(process.env.startConfirm);
let endTime = new Date(process.env.endConfirm);

// Decide Pronite
let curPronite = process.env.curPronite;
const secret = require('../Models/secrets');

//***************CONFIRM PERIOD CONFIG*****************//

let confirmPass = module.exports = {};

let utils = require('../utils');
let jwt = require('jsonwebtoken');
//let confMailer = require('../mailers/confmailer');
let qr = require('qr-image');
let fs = require('fs');
let crypto = require('crypto');
let hummus = require('hummus');

let dynamoDB = utils.connectToDB();
let tableName = '2019_RDV_Registrations';


confirmPass.confirm = function (req, res) {
  let curTime = new Date();
  console.log(req.body)
  if (curTime < startTime)
    return utils.error(res, 400, "Have Patience! Confirm Period hasn't started yet :)");
  if (curTime > endTime)
    return utils.error(res, 400, "Confirm Period Over!");

  // let token = req.query.token;
  let pronite = req.body.pronite;
  let token = req.body.token;

  console.log(pronite)
  console.log(curPronite)
  if (!token || !pronite)
    return utils.error(res, 400, "Bad Request");

  if (pronite !== curPronite)
    return utils.error(res, 400, "Not Accepting Confirmation for this Pronite today!");

  jwt.verify(token, secret.passbook, function(err, user) {
    if (err)
      return utils.error(res, 401, "Invalid Token");

    dynamoDB.get(params("rdv_number", user.rdv_number), function (err, data) {
      if (err) {
        return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
      } else {
        if (!data.Item)
          return utils.error(res, 400, "User Does Not Exist!");
        else
          confirmUser(req, res, data.Item, pronite);
      }
    });
  });
};


// confirm user here
function confirmUser(req, res, user, pronite) {

  console.log(user)
  if (!user[pronite])
    return utils.error(res, 400, "You are not eligible to confirm a Pass for this ProNite!");

  if (user[pronite].startsWith("Waitlist"))
    return utils.error(res, 400, "You name is in the waitlist, please come in the duration of waitlist to confirm your pass.");
// If not starts with booked it means confimed
  if (!user[pronite].startsWith("Booked"))
    return utils.error(res, 400, "Your pass is already confirmed. See you at OAT!");

  let confirmString = "Confirmed 1";

  let confirmParams = {
    TableName: tableName,
    Key: {
      'rdv_number': user.rdv_number
    },
    UpdateExpression: 'SET ' + pronite + ' = :value',
    ExpressionAttributeValues: {
      ':value': confirmString
    }
  };

  dynamoDB.update(confirmParams, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
    } else {
      //bookMailer.sendMail(email, fullName, pronite, rdv_number);
      res.json({
        error: false,
        message: "Pass confirmed succesfully!",
      });
    }
  });
}


// Qr Code verification
// rdvnumber-pronite;(md5hash of qr[0]+secretkey)
confirmPass.verify = function (req, res) {
  let qr = req.query.qr;

  if (!qr)
    return utils.error(res, 400, "Bad Request");

  let qrSplit = qr.split(';');
  let secretKey = "%%Wubba%Lubba%Dub%Dub%%";
  let hashedData = crypto.createHash('md5').update(qrSplit[0] + secretKey).digest('hex');

  if (hashedData !== qrSplit[1])
    return utils.error(res, 400, "Tampered QR Code!!");

  let dataSplit = qrSplit[0].split('-');

  if (dataSplit.length < 2)
    return utils.error(res, 400, "Bad Request");

  let rdvNumber = dataSplit[0];
  let pronite = dataSplit[1];
  let id = (dataSplit.length > 2)? dataSplit[2] : "";

  if (!rdvNumber || !pronite)
    return utils.error(res, 400, "Bad Request");

  dynamoDB.get(params("rdv_number", rdvNumber), function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (!data.Item)
        return utils.error(res, 400, "User Does Not Exist!");
      else
        verifyUser(req, res, data.Item, pronite, id);
    }
  });
};

function verifyUser(req, res, user, pronite, id) {
  let bookString = user[pronite];

  if (!bookString)
    return utils.error(res, 401, "No Booking Found!");

  let numPasses = parseInt(bookString.split(' ')[1]);

  if (bookString.startsWith("Confirmed")) {
    let status = (bookString.length > 2)? bookString.split(' ')[2] : "";

    if (status == 'E')
      return utils.error(res, 401, "User already entered on this Pass!");

    let enterParams = {
      TableName: tableName,
      Key: {
        'rdv_number': user.rdv_number
      },
      UpdateExpression: 'SET ' + pronite + ' = :value',
      ExpressionAttributeValues: {
        ':value': bookString + " E"
      }
    };

    dynamoDB.update(enterParams, function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        return res.json({
          user: user,
          message: "Booking Found! Admit " + numPasses + " people."
        });
      }
    });
  }

  else if (bookString.startsWith("Invitee")) {
    let entered = (bookString.length > 3)? bookString.split(' ').slice(3) : [];
    let numEntered = entered.length;

    if (numEntered >= numPasses)
      return utils.error(res, 401, numEntered + " people already entered on this pass. Reject!");

    if (!id)
      return utils.error(res, 400, "Bad Request");

    if (entered.indexOf(id) > -1)
      return utils.error(res, 401, "Invitee already entered on this Pass!");

    let updateParams = {
      TableName: tableName,
      Key: {
        'rdv_number': user.rdv_number
      },
      UpdateExpression: 'SET ' + pronite + ' = :value',
      ExpressionAttributeValues: {
        ':value': bookString + " " + id
      }
    };

    dynamoDB.update(updateParams, function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        return res.json({
          user: user,
          message: "Booking Found! Admit One."
        });
      }
    });
  }

  else if (bookString.startsWith("Sponsor")) {
    let entered = parseInt(bookString.split(' ')[2]);

    if (entered >= numPasses)
      return utils.error(res, 401, entered + " people already entered on this pass. Reject!");

    let updateParams = {
      TableName: tableName,
      Key: {
        'rdv_number': user.rdv_number
      },
      UpdateExpression: 'SET ' + pronite + ' = :value',
      ExpressionAttributeValues: {
        ':value': "Sponsor " + numPasses + " " + (entered+1)
      }
    };

    dynamoDB.update(updateParams, function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        return res.json({
          user: user,
          message: "Booking Found! Admit One. " + (entered+1) + " out of " + numPasses + " entered on this Pass."
        });
      }
    });
  }

  else
    return utils.error(res, 401, "Not eligible for entering into ProNite!");
}

// Out controller
confirmPass.out = function (req, res) {
  let qr = req.query.qr;

  if (!qr)
    return utils.error(res, 400, "Bad Request");

  let qrSplit = qr.split(';');
  let secretKey = "%%Wubba%Lubba%Dub%Dub%%";
  let hashedData = crypto.createHash('md5').update(qrSplit[0] + secretKey).digest('hex');

  if (hashedData !== qrSplit[1])
    return utils.error(res, 400, "Tampered QR Code!!");

  let dataSplit = qrSplit[0].split('-');

  if (dataSplit.length < 2)
    return utils.error(res, 400, "Bad Request");

  let rdvNumber = dataSplit[0];
  let pronite = dataSplit[1];
  let id = (dataSplit.length > 2)? dataSplit[2] : "";

  if (!rdvNumber || !pronite)
    return utils.error(res, 400, "Bad Request");

  dynamoDB.get(params("rdv_number", rdvNumber), function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (!data.Item)
        return utils.error(res, 400, "User Does Not Exist!");
      else
        verifyUserOut(req, res, data.Item, pronite, id);
    }
  });
};

//Actual out counter
function verifyUserOut(req, res, user, pronite, id) {
  let bookString = user[pronite];

  if (!bookString)
    return utils.error(res, 401, "No Booking Found!");

  let numPasses = parseInt(bookString.split(' ')[1]);

  if (bookString.startsWith("Confirmed")) {
    let status = (bookString.length > 2)? bookString.split(' ')[2] : "";

    if (!(status == 'E'))
      return utils.error(res, 401, "User hasn't entered on this Pass!");

    let enterParams = {
      TableName: tableName,
      Key: {
        'rdv_number': user.rdv_number
      },
      UpdateExpression: 'SET ' + pronite + ' = :value',
      ExpressionAttributeValues: {
        ':value': bookString + " O"
      }
    };

    dynamoDB.update(enterParams, function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        return res.json({
          user: user,
          message: "Booking Found! Let  " + numPasses + " people Out."
        });
      }
    });
  }

  else if (bookString.startsWith("Invitee")) {
    let entered = (bookString.length > 3)? bookString.split(' ').slice(3) : [];
    let numEntered = entered.length;

    if (numEntered >= numPasses)
      return utils.error(res, 401, numEntered + " people already entered on this pass. Reject!");

    if (!id)
      return utils.error(res, 400, "Bad Request");

    if (entered.indexOf(id) > -1)
      return utils.error(res, 401, "Invitee already entered on this Pass!");

    let updateParams = {
      TableName: tableName,
      Key: {
        'rdv_number': user.rdv_number
      },
      UpdateExpression: 'SET ' + pronite + ' = :value',
      ExpressionAttributeValues: {
        ':value': bookString + " " + id
      }
    };

    dynamoDB.update(updateParams, function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        return res.json({
          user: user,
          message: "Booking Found! Admit One."
        });
      }
    });
  }

  else if (bookString.startsWith("Sponsor")) {
    let entered = parseInt(bookString.split(' ')[2]);

    if (entered >= numPasses)
      return utils.error(res, 401, entered + " people already entered on this pass. Reject!");

    let updateParams = {
      TableName: tableName,
      Key: {
        'rdv_number': user.rdv_number
      },
      UpdateExpression: 'SET ' + pronite + ' = :value',
      ExpressionAttributeValues: {
        ':value': "Sponsor " + numPasses + " " + (entered+1)
      }
    };

    dynamoDB.update(updateParams, function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        return res.json({
          user: user,
          message: "Booking Found! Admit One. " + (entered+1) + " out of " + numPasses + " entered on this Pass."
        });
      }
    });
  }

  else
    return utils.error(res, 401, "Not eligible for entering into ProNite!");
}


confirmPass.getPDF = function (req, res) {
  let token = req.query.token;
  let pronite = req.query.pronite;
  console.log(token)
  console.log(pronite)
  console.log(req.body)
  console.log(req.query)
  if (!token || !pronite)
    return utils.error(res, 400, "Bad Request");

  jwt.verify(token, secret.passbook, function(err, user) {
    if (err)
      return utils.error(res, 401, "Invalid Token");
    dynamoDB.get(params("rdv_number", user.rdv_number), function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        if (!data.Item)
          return utils.error(res, 401, "Invalid Token");
        delete data.Item['password'];
        console.log("pdf making")
        makePDF(req, res, data.Item, pronite);
      }
    })
  });
};

function makePDF (req, res, user, pronite) {
  let bookString = user[pronite];

  if (!bookString)
    return utils.error(res, 401, "No Booking Found!");

  if (bookString.startsWith("Booked"))
    return utils.error(res, 401, "Please Confirm your booking before generating Pass!");

  if (!bookString.startsWith("Confirmed"))
    return utils.error(res, 401, "Invalid PDF Generation");

  let numPasses = bookString.split(' ')[1];

  let QRstring = user.rdv_number + "-" + pronite;
  let secretKey = "%%Wubba%Lubba%Dub%Dub%%";
  QRstring += ";" + crypto.createHash('md5').update(QRstring + secretKey).digest('hex');

  let qr_svg = qr.image(QRstring, { type: 'png', margin: 1, size: 4 });
  let stream = fs.createWriteStream(user.rdv_number + '.png');

  qr_svg.on('end', function () {
    this.emit('close');
    stream.end();
  });

  stream.on('close', function () {

    let tempFile = "passes/" + pronite + ".pdf";
    // res.json({message: "passes will be mailed"});
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=' + user.rdv_number + '_' + pronite + '.pdf'
    });
    let writer = hummus.createWriterToModify(new hummus.PDFRStreamForFile(tempFile), new hummus.PDFStreamForResponse(res));

    let pageModifier = new hummus.PDFPageModifier(writer,0, true);
    pageModifier.startContext().getContext().drawImage(227, 518, user.rdv_number + '.png');
    pageModifier.getContext().writeText(user.first_name , 426, 594, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:16,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText(user.rdv_number, 464, 575, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:16,colorspace:'gray',color:0x00});

    editNumPasses(pageModifier, writer, numPasses);

    if (user.email.endsWith("@iitd.ac.in")) {
        editStudentPDF(pageModifier, writer);
    }
    else if (user.college === 'IIT Delhi Staff') {
        editFacultyPDF(pageModifier, writer);
    }else
        editExternalPDF(pageModifier, writer);

    pageModifier.endContext().writePage();
    writer.end();
    fs.unlinkSync(user.rdv_number + '.png');
    console.log("pass dowloaded")
    res.end();
  });

  qr_svg.pipe(stream);
}


function editStudentPDF(pageModifier, writer) {
  pageModifier.getContext().writeText("IIT DELHI", 101, 445, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});
  pageModifier.getContext().writeText("STUDENT", 97, 405, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});

  pageModifier.getContext().writeText("Please Do Not Forget:", 90, 340, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:15,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- This ticket allows only ONE person and is valid only for IIT Delhi students.", 95, 320, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- This ticket is not valid without your IIT Delhi I-Card.", 95, 305, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Please bring a printout / show on mobile phone when you come for entry to pronite.", 95, 290, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Entry to Open Air Theatre (OAT) will be allowed only till 6:30 pm in the evening.", 95, 275, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Rendezvous reserves the right to deny entry to any candidate.", 95, 260, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Duplication or digital modification of this ticket will prevent you from being admitted.", 95, 245, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Any student with alcohol, cigarettes or other substance abuse will be penalised with disciplinary action.", 95, 230, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Carry-on items like shoulder bags, laptop bags, briefcases are not allowed in any case.", 95, 215, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Water bottles and food items are not allowed inside the Open Air Theatre (OAT).", 95, 200, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  // pageModifier.getContext().writeText("- Children below the age of 12 are restricted to attend the pronite for security reasons.", 95, 185, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Parking inside the campus is discouraged but will be provided to limited vehicles at a cost of 300/-.", 95, 170, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("Important Note:", 95, 185, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:15,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- It is mandatory to download and register on the Cashify app using the mentioned link only in order to", 95, 160, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- confirm your entry https://play.google.com/store/apps/details?id=com.reglobe.cashify", 95, 145, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});

}

function editFacultyPDF(pageModifier, writer) {
  pageModifier.getContext().writeText("FACULTY", 98, 445, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});
  pageModifier.getContext().writeText("& STAFF", 105, 405, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});

  pageModifier.getContext().writeText("Please Do Not Forget:", 90, 340, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:15,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- This ticket allows entry of mentioned number of people and is valid only for IIT Delhi Community.", 95, 320, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- This ticket is not valid without a IIT Delhi photo identity card.", 95, 305, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Please bring a printout / show on mobile phone when you come for entry to pronite.", 95, 290, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Entry to Open Air Theatre (OAT) will be allowed only till 6:30 pm in the evening.", 95, 275, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Duplication or digital modification of this ticket will lead to confiscation of ID card..", 95, 260, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Carry-on items like shoulder bags, laptop bags, briefcases are not allowed in the pronite.", 95, 245, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Water bottles and food items are not allowed inside the Open Air Theatre (OAT).", 95, 230, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Children below the age of 12 are not allowed.", 95, 215, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
}

function editExternalPDF(pageModifier, writer) {
  pageModifier.getContext().writeText("EXTERNAL", 85, 445, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});
  pageModifier.getContext().writeText("STUDENT", 97, 405, {font: writer.getFontForFile('passes/fonts/LemonMilkbold.otf'),size:35,colorspace:'gray',color:0xFF});

  pageModifier.getContext().writeText("Please Do Not Forget:", 90, 340, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:15,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- This ticket allows only ONE person and is valid only for students not from IIT Delhi.", 95, 320, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- This ticket is not valid without a photo identity card.", 95, 305, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Please bring a printout / show on mobile phone when you come for entry to pronite.", 95, 290, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Entry to Open Air Theatre (OAT) will be allowed only till 6:30 pm in the evening.", 95, 275, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Rendezvous reserves the right to deny entry to any candidate.", 95, 260, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Duplication or digital modification of this ticket will lead to heavy penalty.", 95, 245, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Anyone found with alcohol, cigarettes or any other form of substance abuse will be heavily penalised.", 95, 230, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Carry-on items like shoulder bags, laptop bags, briefcases are not allowed.", 95, 215, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Water bottles and food items are not allowed inside the Open Air Theatre (OAT).", 95, 200, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  // pageModifier.getContext().writeText("- Children below the age of 12 are not allowed.", 95, 185, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("- Parking inside the campus will be chargeable at Rs.300/-.", 95, 170, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
  pageModifier.getContext().writeText("Important Note:", 95, 185, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:15,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- It is mandatory to download and register on the Cashify app using the mentioned link only in order to", 95, 160, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});
    pageModifier.getContext().writeText("- confirm your entry https://play.google.com/store/apps/details?id=com.reglobe.cashify", 95, 145, {font: writer.getFontForFile('passes/fonts/MyriadPro-Cond.otf'),size:13,colorspace:'gray',color:0x00});

}

function editNumPasses(pageModifier, writer, numPasses) {
  if (numPasses === '1')
    pageModifier.getContext().writeText("ADMIT ONE", 239, 675, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:30,colorspace:'gray',color:0x00});
  else if (numPasses === '2')
    pageModifier.getContext().writeText("ADMIT TWO", 238, 675, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:30,colorspace:'gray',color:0x00});
  else if (numPasses === '3')
    pageModifier.getContext().writeText("ADMIT THREE", 228, 675, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:30,colorspace:'gray',color:0x00});
  else if (numPasses === '4')
    pageModifier.getContext().writeText("ADMIT FOUR", 233, 675, {font: writer.getFontForFile('passes/fonts/MyriadPro-BoldCond.otf'),size:30,colorspace:'gray',color:0x00});
}


confirmPass.overallReg = function(req, res) {
  let reg = {
    Faculty: {
      Confirmed: 0,
      Entered: 0,
    },
    IIT: {
      Booked: 0,
      Confirmed: 0,
      Waitlisted: 0,
      Entered: 0,
    },
    External: {
      Booked: 0,
      Confirmed: 0,
      Waitlisted: 0,
      Entered: 0,
    },
    Invitees: {
      TotalInvites: 0,
      Invited: 0,
      Entered: 0,
    },
    Sponsors: {
      Invited: 0,
      Entered: 0,
    },
    ExpectedEntry: 0,
    CurrentEntry: 0,
  };

  const pronite = req.query.pronite;

  if (!pronite)
    return utils.error(res, 400, "Bad Request");
  if (pronite !== "melange" && pronite !== "spectrum" && pronite !== "kaleidoscope" && pronite !== "dhoom")
    return utils.error(res, 400, "Bad Request");

  onRegScan(res, [], null, 0, pronite, (registrations) => {

    registrations.forEach((r) => {
      const booking = r[pronite];
      if (!booking)
        return;

      const splitBooking = booking.split(' ');

      let type = "";
      if (r.college === 'IIT Delhi Staff')
        type = "Faculty";
      else if (r.email.endsWith('@iitd.ac.in'))
        type = "IIT";
      else
        type = "External";

      if (booking.startsWith("Booked")) {

        reg[type].Booked += 1;

      } else if (booking.startsWith("Confirmed")) {

        reg[type].Confirmed += parseInt(splitBooking[1]);
        if (splitBooking[2] && splitBooking[2] === 'E')
          reg[type].Entered += parseInt(splitBooking[1]);

      } else if (booking.startsWith("Waitlisted")) {

        reg[type].Waitlisted += 1;

      } else if (booking.startsWith("Invitees")) {

        reg.Invitees.TotalInvites += parseInt(splitBooking[1]);
        reg.Invitees.Invited += parseInt(splitBooking[2]);
        reg.Invitees.Entered += splitBooking.length - 3;

      } else if (booking.startsWith("Sponsor")) {

        reg.Sponsors.Invited += parseInt(splitBooking[1]);
        reg.Sponsors.Entered += parseInt(splitBooking[2]);

      }
    });

    reg.ExpectedEntry = reg.Faculty.Confirmed + reg.IIT.Confirmed + reg.External.Confirmed + reg.Invitees.Invited + reg.Sponsors.Invited;
    reg.CurrentEntry = reg.Faculty.Entered + reg.IIT.Entered + reg.External.Entered + reg.Invitees.Entered + reg.Sponsors.Entered;

   res.setHeader('Content-Type', 'application/json');
   return res.send(JSON.stringify(reg, null, 4));
  })
};

confirmPass.overallReg2 = function(req, res) {
  let reg = {
    Faculty: {
      Confirmed: 0,
      Entered: 0,
    },
    IIT: {
      Booked: 0,
      Confirmed: 0,
      Waitlisted: 0,
      Entered: 0,
    },
    External: {
      Booked: 0,
      Confirmed: 0,
      Waitlisted: 0,
      Entered: 0,
    },
    Invitees: {
      TotalInvites: 0,
      Invited: 0,
      Entered: 0,
    },
    Sponsors: {
      Invited: 0,
      Entered: 0,
    },
    ExpectedEntry: 0,
    CurrentEntry: 0,
  };

  const pronite = req.query.pronite;

  if (!pronite)
    return utils.error(res, 400, "Bad Request");
  if (pronite !== "melange" && pronite !== "spectrum" && pronite !== "kaleidoscope" && pronite !== "dhoom")
    return utils.error(res, 400, "Bad Request");

  onRegScan(res, [], null, 0, pronite, (registrations) => {

    registrations.forEach((r) => {
      const booking = r[pronite];
      if (!booking)
        return;

      const splitBooking = booking.split(' ');

      let type = "";
      if (r.college === 'IIT Delhi Staff')
        type = "Faculty";
      else if (r.email.endsWith('@iitd.ac.in'))
        type = "IIT";
      else
        type = "External";

      if (booking.startsWith("Booked")) {

        reg[type].Booked += 1;

      } else if (booking.startsWith("Confirmed")) {

        reg[type].Confirmed += parseInt(splitBooking[1]);
        if (splitBooking[2] && splitBooking[2] === 'E')
          reg[type].Entered += parseInt(splitBooking[1]);

      } else if (booking.startsWith("Waitlisted")) {

        reg[type].Waitlisted += 1;

      } else if (booking.startsWith("Invitees")) {

        reg.Invitees.TotalInvites += parseInt(splitBooking[1]);
        reg.Invitees.Invited += parseInt(splitBooking[2]);
        reg.Invitees.Entered += splitBooking.length - 3;

      } else if (booking.startsWith("Sponsor")) {

        reg.Sponsors.Invited += parseInt(splitBooking[1]);
        reg.Sponsors.Entered += parseInt(splitBooking[2]);

      }
    });

    reg.Invitees.TotalInvites = Math.floor(reg.Invitees.TotalInvites / 2);
    reg.Invitees.Invited = Math.floor(reg.Invitees.Invited / 2);
    reg.Invitees.Entered = Math.floor(reg.Invitees.Entered / 2);

    reg.ExpectedEntry = reg.Faculty.Confirmed + reg.IIT.Confirmed + reg.External.Confirmed + reg.Invitees.Invited + reg.Sponsors.Invited;
    reg.CurrentEntry = reg.Faculty.Entered + reg.IIT.Entered + reg.External.Entered + reg.Invitees.Entered + reg.Sponsors.Entered;

    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(reg, null, 4));
  })
};

function onRegScan(res, registrations, lastEvaluatedKey, num, pronite, cb) {
  let params = {
    TableName: tableName,
    AttributesToGet: [
      'email',
      'college',
      pronite,
    ],
  };
  if (!lastEvaluatedKey && num != 0)
    cb(registrations);
  else {
    if (lastEvaluatedKey)
      params.ExclusiveStartKey = lastEvaluatedKey;
    dynamoDB.scan(params, function (err, data) {
      if (err)
        return utils.error(res, 500, "Internal Server Error");
      else {
        registrations = registrations.concat(data.Items);
        onRegScan(res, registrations, data.LastEvaluatedKey, num+1, pronite, cb);
      }
    })
  }
}

function params (key, id) {
  if (key == 'rdv_number') {
    return {
      TableName: '2019_RDV_Registrations',
      Key: {
        rdv_number: id
      }
    }
  } else {
    return {
      TableName: '2019_RDV_Registrations',
      IndexName: 'email',
      KeyConditionExpression: 'email = :value',
      ExpressionAttributeValues: {
        ':value': id
      }
    }
  }
}