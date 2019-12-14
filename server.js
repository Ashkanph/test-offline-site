/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// This serves static files from the specified directory
app.use(express.static(__dirname + '/build'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/getUsers', (req, res) => {
  let options = {
    root: __dirname + '/'
  };

  const fileName = 'users.json';
  res.sendFile(fileName, options, (err) => {
    if (err) {
      console.log('err ', err);
      
      res.sendStatus(500);
      return;
    }
  });
});

const server = app.listen(3002, () => {

  const host = server.address().address;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

