var express = require('express');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');
var conversionRoute = require(__dirname + '/serverSideConversion.js');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(conversionRoute.routeAV);

app.use('/',express.static(__dirname + '/public'));
app.use('/testing',express.static(__dirname + '/testing'));

// ITALIANO
app.get('/',function(req,res){
  res.status(200).sendFile(__dirname + '/public/it/map.html')
});

app.get('/login',function(req,res){
  res.status(200).sendFile(__dirname + '/public/it/login.html')
});

app.get('/informazioni',function(req,res){
  res.status(200).sendFile(__dirname + '/public/it/informazioni.html')
});

app.get('/infoeditor',function(req,res){
  res.status(200).sendFile(__dirname + '/public/it/infoeditor.html')
});

app.get('/editor',function(req,res){
  res.status(200).sendFile(__dirname + '/public/it/editor.html')
});

app.get('/creaclip',function(req,res){
  res.status(200).sendFile(__dirname + '/public/it/creaclip.html')
});

app.get('/about',function(req,res){
  res.status(200).sendFile(__dirname + '/public/it/about.html')
});

app.get('/playlist',function(req,res){
  res.status(200).sendFile(__dirname + '/public/it/playlistEditor.html')
});

app.get('/caricati',function(req,res){
  res.status(200).sendFile(__dirname + '/public/it/clipCaricate.html')
});

//INGLESE
app.get('/en',function(req,res){
  res.status(200).sendFile(__dirname + '/public/en/map.html')
});

app.get('/en/login',function(req,res){
  res.status(200).sendFile(__dirname + '/public/en/login.html')
});

app.get('/en/information',function(req,res){
  res.status(200).sendFile(__dirname + '/public/en/informazioni.html')
});

app.get('/en/infoeditor',function(req,res){
  res.status(200).sendFile(__dirname + '/public/en/infoeditor.html')
});

app.get('/en/editor',function(req,res){
  res.status(200).sendFile(__dirname + '/public/en/editor.html')
});

app.get('/en/createclip',function(req,res){
  res.status(200).sendFile(__dirname + '/public/en/creaclip.html')
});

app.get('/en/about',function(req,res){
  res.status(200).sendFile(__dirname + '/public/en/about.html')
});

app.get('/en/playlist',function(req,res){
  res.status(200).sendFile(__dirname + '/public/en/playlistEditor.html')
});

app.get('/en/uploaded',function(req,res){
  res.status(200).sendFile(__dirname + '/public/en/clipCaricate.html')
});

module.exports = app;

app.listen(8000);
