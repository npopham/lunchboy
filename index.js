const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 5000;
const lunchboy = require('./lunchboy');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({extended: true, verify: lunchboy.verifySlackSignature}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.send("Hi stranger! I'm Lunchboy."))
  .post('/', lunchboy.main)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
