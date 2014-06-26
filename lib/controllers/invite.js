'use strict';

var mongoose = require('mongoose'),
    Mailgun = require('mailgun-js'),
    User = mongoose.model('User'),
    Invite = mongoose.model('Invite');

exports.sendInvite = function (req, res) {
  var inviteeEmail = req.params.email;
  var data = {
    from: 'my2cents registry <register@my2cents.io>',
    to: inviteeEmail,
    subject: 'Please register for my2cents',
    text: 'http://www.my2cents.io'
  };
  var mailgun = new Mailgun({
    apiKey: process.env.API_KEY,
    domain: process.env.SANDBOX
  });

  Invite.findOne({email: inviteeEmail}, function (err, invite) {
    if(err) {return res.send(404, err);}
    if(invite) {return res.send(200);}      
    User.findOne({
      email: inviteeEmail
    }, function (err, user) {
      if(err) {return res.send(404, err);}
      if(user) {return res.send(200);}
      Invite.create({email: inviteeEmail}, function (err) {
        if(err) {return res.send(404, err);}
        mailgun.messages().send(data, function (err, body) {
          if (err) {return res.send(404, err);}
          return res.send(200);
        });  
      });
    });
  });
};
