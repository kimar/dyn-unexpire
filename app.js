"use strict";

var inbox = require("inbox");
var request = require("request");

var client = inbox.createConnection(false, "imap.yourserver.com", {
    secureConnection: true,
    auth:{
        user: "user@yourserver.com",
        pass: "yourpassword"
    }
});

client.on("connect", function(){
    client.openMailbox("INBOX", function(error, info){
        if(error) throw error;

        client.listMessages(-10, function(err, messages){
            messages.forEach(function(message){
                console.log(message.UID + ": " + message.title);
                client.fetchFlags(message.UID, function(error, flags) {
                    console.log('Flags for UID (' + message.UID + '): ' + flags);
                });
            });
        });

    });
});

client.on("new", function(message){
        console.log("New incoming message " + message.title);
        var messageStream = client.createMessageStream(message.UID);
        var message;
        messageStream.on('data', function(chunk) {
            message += chunk;
        });

        messageStream.on('end', function() {
            handleMessage(message);
        });
});

function handleMessage(text) {
    var parts = text.split('https://account.dyn.com/');
    var result = parts[1].split('\n');
    var dynlink = result[0];
    console.log('DynDns Link: ' + dynlink)
    if(dynlink.length > 0) {
        var url = 'https://account.dyn.com/' + dynlink;
        console.log('Calling: ' + url);
        request(url, function(error, response, body) {
            if(body.indexOf('Account Activity Confirmed!') !== -1) {
                console.log('Account Activity Confirmed!');
            }
        });
    }
}

client.connect();
