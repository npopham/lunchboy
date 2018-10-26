const crypto = require('crypto');
const restaurants = require('./restaurants');
const https = require('https');

//var restaurants = ["Blue Ribbon", "Jimmy's", "Cabot's", "Pho 1", "Ixtapa", "Conley's", "Joseph's Two"];

async function main(req, res) {
    console.log("Responding to lunchboy request");

    //Slack is impatient - have to send an immediate response
    res.send({
        response_type: "ephemeral",
        text: "Just a second, I'm cooking up a response...."
    });

    console.log("Sent quick followup, continuing with delayed response");

    let numSuggestions = 3;

    let count = await restaurants.count();

    console.log(`Found ${count} restaurants in database`);

    if(count < numSuggestions) {
        numSuggestions = count;
    }

    let suggestedIds = [];
    while(suggestedIds.length < numSuggestions) {
        let newRandom = Math.floor(Math.random() * count);

        if(suggestedIds.indexOf(newRandom) < 0) {
            suggestedIds.push(newRandom);
        }
    }

    console.log(`Chose ${suggestedIds} as selected restaurants`);

    try {
        let selectedRestaurants = await restaurants.getSelected(suggestedIds);   

        console.log(`Retrieved ${selectedRestaurants}`);

        let message = `Hello! I am just a baby and I only know ${count} restaurants...but may I suggest ${selectedRestaurants[0].full_name}, ${selectedRestaurants[1].full_name}  or ${selectedRestaurants[2].full_name}?`;
        let finalResponse = {
            response_type: "in_channel",
            text: message
        };
        
        let responseUrl = req.get("response_url");

        let options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log(`Sending final response to ${responseUrl}`);
        let delayedRequest = https.request(responseUrl, options, (res) => {
            console.log(res.statusCode);
            console.log(res);
        });

        delayedRequest.write(finalResponse);
        delayedRequest.end();
    }
    catch (err) {
        console.log("Error while getting selected restaurants");
        console.log(err);
    }
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
