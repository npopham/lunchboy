const crypto = require('crypto');

var restaurants = ["Blue Ribbon", "Jimmy's", "Cabot's", "Pho 1", "Ixtapa", "Conley's"];

function main(req, res) {
    var index = Math.floor(Math.random() * restaurants.length);
    var index2 = Math.floor(Math.random() * restaurants.length);

	var message = `Hello! I am just a baby and I only know ${restaurants.length} restaurants...but may I suggest ${restaurants[index]} or ${restaurants[index2]}?`;
	res.send({
        response_type: "in_channel",
		text: message
	});
}

function verifySlackSignature(req,res,buf) {
    var slackTimestamp = req.get('X-Slack-Request-Timestamp');

    if(Math.abs((Date.now() / 1000)- slackTimestamp) > (60 * 5)) {
        console.log("Timestamp " + slackTimestamp + " isn't close enough to current time " + new Date().getTime() );
        throw Error("Timestamp invalid");
    }

    var basestring = "v0:" + slackTimestamp + ":" + buf;
    console.log("basestring is " + basestring);

    var secret = process.env.SLACK_SIGNING_SECRET || "test"; 

    var hash = "v0=" + crypto.createHmac('sha256', secret)
        .update(basestring)
        .digest('hex');

    var slackSignature = req.get('X-Slack-Signature') || "";
    console.log("Comparing own :" + hash + " to " + slackSignature);
    if(hash.length != slackSignature.length) {
        throw Error("Slack verification signature lengths don't match");
    }
    var signaturesMatch = crypto.timingSafeEqual(Buffer.from(hash, 'utf-8'), Buffer.from(slackSignature, 'utf-8'));

    if(signaturesMatch) {
        console.log("Slack verified!");
    }
    else {
        throw Error("Slack signature doesn't match!");
    }
}

module.exports = {
    main: main,
    verifySlackSignature: verifySlackSignature 
};
