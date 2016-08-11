'use strict';

var request = require('request');
var fs = require('fs');
var crypto = require('crypto');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
module.exports = function (options) {
  function object() {// constructor
    
   EventEmitter.call(this);// hérite to EventEmitter
    
    
   var that = this;

    var socket = require('socket.io-client')(options.url,  {path: options.path});
    socket.on('connect', function () {
      console.log("connecter by socket io to blockchainiz");
    });
    socket.on('event', function (data) {
      console.log(' event', data);

    });

    socket.on('disconnect', function () {
      console.log("disconnecter by socket io to blockchainiz");

    });




    this.createContract = function (fileOfContract, callBack) {

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




    this.executeFunction = function (id, functionName, param, callBack) {

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


    this.getAddr = function (id, callBack) {

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
    var listEvents = [];

    this.listenEvent = function (id, eventName) {
      socket.emit('listener_contract', id, eventName);
      listEvents.push({id: id, eventName: eventName});

    };


    socket.on('reconnect', function () {
      console.log("reconnecter by socket io to blockchainiz");
      for (let listEventIndex in listEvents)
      {
        let listEvent = listEvents[listEventIndex];
        socket.emit('listener_contract', listEvent.id, listEvent.eventName);
      }
    });



    socket.on('listener_contract', function (id, eventName, result) {
      console.log('listener_contract resu', id, eventName, result);
      that.emit('listener_contract', id, eventName, result);
    });
    socket.on('error_text', function (eventHaveError, error) {
      console.log('error blockchainiz sokect', eventHaveError, error);

      that.emit('error blockchainiz sokect', eventHaveError, error);
    });


  };

  util.inherits(object, EventEmitter);// hérite to EventEmitter

  // this.on('test', function (test) {});
  return new object;
};



