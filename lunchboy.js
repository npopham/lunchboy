const crypto = require('crypto');
const restaurants = require('./restaurants');

//var restaurants = ["Blue Ribbon", "Jimmy's", "Cabot's", "Pho 1", "Ixtapa", "Conley's", "Joseph's Two"];

async function main(req, res) {
    var numSuggestions = 3;

    let count = await restaurants.count();
    if(count < numSuggestions) {
        numSuggestions = count;
    }

    var suggestedIds = [];
    while(suggestedIds.length < numSuggestions) {
        var newRandom = Math.floor(Math.random() * count);

        if(suggestedIds.indexOf(newRandom) >= 0) {
            suggestedIds.push(newRandom);
        }
    }

    var selectedRestaurants = await restaurants.getSelected(suggestedIds);   

	var message = `Hello! I am just a baby and I only know ${count} restaurants...but may I suggest ${selectedRestaurants[0].full_name}, ${selectedRestaurants[1].full_name}  or ${selectedRestaurants[2].full_name}?`;
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
