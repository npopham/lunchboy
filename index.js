if(process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 5000;
const lunchboy = require('./lunchboy');
const restaurants = require('./restaurants');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({extended: true, verify: lunchboy.verifySlackSignature}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => restaurants.count()
    .then((count) => res.send("Hi stranger! I'm Lunchboy. I know about " + count + " restaurants."))
    .catch((err) => res.send("Hi, I'm Lunchboy. I have a headache. " + err))
    )
  .post('/', lunchboy.main)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
