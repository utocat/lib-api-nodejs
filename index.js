var request = require('request');
var fs = require('fs');
var crypto = require('crypto');

module.exports = function (options) {
  var object = {};


  object.createContract = function (fileOfContract, callBack) {

// Read the source file for the smart contract and send it to blockchainiz to upload it on the blockchain

    fs.readFile(fileOfContract, 'utf8', function (err, data) {

      if (err) {
        console.log('Error reading the file containing the source code of the smart contract');
      } else {

        var rawBody = {source: data, parameters: []};

        // a number that will always be higher than the last one when calling the blockchainiz API
        var nonce = Date.now();

        // create the HMAC token that will be used to authorize the transaction on the blockchainiz API
        // we use a different URL for blockchainiz according to the fact that we are in debug or test mode
        var hash = crypto.createHmac('SHA512', options.private)
          .update(nonce + options.url + '/contract/ethereum/solidity' + JSON.stringify(rawBody))
          .digest('hex');

        // make the request to blockchainiz to add the new entry in the smart contract
        request({
          url: options.url + '/contract/ethereum/solidity',
          headers: {
            'x-Api-Key': options.public,
            'x-Api-Signature': hash,
            'x-Api-Nonce': nonce
          },
          method: 'post',
          json: true,
          body: rawBody
        },
          function (err, res, body) {
            if (err && res.statusCode !== 201) {
              console.log('error deploying the contract');
            } else {
              console.log('contract deployed successfully');
              console.log(body);
              callBack(body.id);
            }
          });
      }
    });
  };




  object.executeFunction = function (id, functionName, param, callBack) {

// Read the source file for the smart contract and send it to blockchainiz to upload it on the blockchain



    var rawBody = {parameters: param};

    // a number that will always be higher than the last one when calling the blockchainiz API
    var nonce = Date.now();

    // create the HMAC token that will be used to authorize the transaction on the blockchainiz API
    // we use a different URL for blockchainiz according to the fact that we are in debug or test mode
    var hash = crypto.createHmac('SHA512', options.private)
      .update(nonce + options.url + '/contract/ethereum/solidity/' + id + '/' + functionName + JSON.stringify(rawBody))
      .digest('hex');

    // make the request to blockchainiz to add the new entry in the smart contract
    request({
      url: options.url + '/contract/ethereum/solidity/' + id + '/' + functionName,
      headers: {
        'x-Api-Key': options.public,
        'x-Api-Signature': hash,
        'x-Api-Nonce': nonce
      },
      method: 'post',
      json: true,
      body: rawBody
    },
      function (err, res, body) {
        if (err) {
          console.log('error deploying the contract');
        } else {
          console.log('contract deployed successfully');
          if (body.errorText)
          {
            callBack(body.errorText, null);
          } else {
            callBack(null, body.result);

          }
        }
      });


  };


  object.getAddr = function (id, callBack) {

// Read the source file for the smart contract and send it to blockchainiz to upload it on the blockchain




    // a number that will always be higher than the last one when calling the blockchainiz API
    var nonce = Date.now();

    // create the HMAC token that will be used to authorize the transaction on the blockchainiz API
    // we use a different URL for blockchainiz according to the fact that we are in debug or test mode
    var hash = crypto.createHmac('SHA512', options.private)
      .update(nonce + options.url + '/contract/' + id)
      .digest('hex');

    // make the request to blockchainiz to add the new entry in the smart contract
    request({
      url: options.url + '/contract/' + id,
      headers: {
        'x-Api-Key': options.public,
        'x-Api-Signature': hash,
        'x-Api-Nonce': nonce
      },
      method: 'get',
      json: true
    },
      function (err, res, body) {
        if (err) {
          console.log('error deploying the contract');
        } else {
          console.log('contract deployed successfully');
          console.log(body);
          callBack(body.address);
        }
      });


  };


  return object;
};



