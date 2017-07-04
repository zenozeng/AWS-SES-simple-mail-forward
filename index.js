var AWS = require('aws-sdk');
var ses = new AWS.SES();

exports.handler = (event, context, callback) => {
    let source = JSON.parse(event.Records[0].Sns.Message).content;
    source = source.replace(/^DKIM-Signature/im, "X-Original-DKIM-Signature");
    source = source.replace(/^From/im, "X-Original-From");
    source = source.replace(/^Source/im, "X-Original-Source");
    source = source.replace(/^Sender/im, "X-Original-Sender");
    source = source.replace(/^Return-Path/im, "X-Original-Return-Path");
    source = source.replace(/^Domainkey-Signature/im, "X-Original-Domainkey-Signature");
    source = `From: AWS SES Mail Forwarding <${process.env.fwd_src_address}>\n` + source;
    ses.sendRawEmail({
        RawMessage: {
            Data: source,
        },
        Destinations: [process.env.fwd_address],
    }, function (err, data) {
        if (err) {
            console.error(err, err.stack);
        }
    });
}
