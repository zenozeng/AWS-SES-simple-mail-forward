const AWS = require('aws-sdk');
const ses = new AWS.SES();
const MailComposer = require('nodemailer/lib/mail-composer')
const simpleParser = require('mailparser').simpleParser;

exports.handler = (event, context, callback) => {
    const source = JSON.parse(event.Records[0].Sns.Message).content;
    
    simpleParser(source).then(mail => {
        const headerMsg = [];
        mail.headers.forEach((val, key) => {
            headerMsg.push(`${key}: ${val}`)
        })
        ses.sendEmail({
            Source: "ses@zenozeng.com",
            Message: {
                Subject: {
                    Data: mail.subject,
                },
                Body: {
                    Data: headerMsg.join('\n'),
                },
            }
        }, (err) => {
            if (err) {
                console.log(err, err.stack)
            }
        })
        mail.headers.forEach((val, key, map) => {
            if (key.toLowerCase().indexOf("dkim-") == 0) {
                map.delete(key);
            }
        })
        const mc = new MailComposer(mail)
        mc.compile().build((err, msg) => {
            if (err) {
                console.error(err, err.stack)
                return
            }
            ses.sendRawEmail({
                RawMessage: {
                    Data: msg,
                },
                Destinations: [process.env.fwd_address],
            }, function (err, data) {
                if (err) {
                    console.error(err, err.stack); // an error occurred
                }
            });

        })
    }).catch(err => {
        console.error(err, err.stack);
    })
}
