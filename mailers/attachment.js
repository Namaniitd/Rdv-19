const AWS = require('aws-sdk');
const utils = require('../utils');
const SES = new AWS.SES({
  accessKeyId: "AKIAIMEEAD3XNEOEMZZQ",
  secretAccessKey: "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",
  region: "us-west-2",
  endpoint: new AWS.Endpoint('https://email.us-west-2.amazonaws.com')
});
const mailcomposer = require('mailcomposer');

return Promise.resolve().then(() => {
  let sendRawEmailPromise;

  const mail = mailcomposer({
    from: 'source@example.com',
    replyTo: 'source@example.com',
    to: 'bob@example.com',
    subject: 'Sample SES message with attachment',
    text: 'Hey folks, this is a test message from SES with an attachment.',
    attachments: [
      {
        path: '/tmp/file.docx'
      },
    ],
  });

  return new Promise((resolve, reject) => {
    mail.build((err, message) => {
      if (err) {
        reject(`Error sending raw email: ${err}`);
      }
      sendRawEmailPromise = this.ses.sendRawEmail({RawMessage: {Data: message}}).promise();
    });

    resolve(sendRawEmailPromise);
  });
});