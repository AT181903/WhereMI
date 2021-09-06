const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const https = require("https");
const fs = require('fs');
const path = require("path");
const multer = require("multer");
const { Readable } = require('stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

function bufferToStream(binary) {
    const readableInstanceStream = new Readable({
      read() {
        this.push(binary);
        this.push(null);
      }
    });

    return readableInstanceStream;

  }

// SET STORAGE
function Uploader(req, res, next) {
  var storage = multer.memoryStorage()

  var upload = multer({storage: storage});

  return upload;
}

module.exports.uploader = Uploader;

router.post('/upload', module.exports.uploader().single("audio"), (req, res, next) => {
  console.log("POST /upload");
  const file = req.file.buffer;
  if (!file) {
    console.log("Error! File not found!");
    res.status(400).send({Error: "File not found!", });
  } else {
    console.log("conversion...");

    /*res.header(206, {
      "Content-Type":"video/webm",
      'Transfer-Encoding': 'chunked'
    });*/

    var proc = new ffmpeg();

    proc.addInput(bufferToStream(file))
  	.on('start', function(ffmpegCommand) {
  	    /// log something maybe
  	})
  	.on('progress', function(progress) {
  	    /// do stuff with progress data if you wanty
      console.log(progress);
  	})
  	.on('end', function() {
  		console.log("conversion completed");
  	    /// encoding is complete, so callback or move on at this point
  	})
  	.on('error', function(error) {
  		console.log(error);
  	  res.send({"error":error.message});
  	})
  	.complexFilter([
  		{
  			filter: 'showwaves',
  			options: {mode: 'cline'}
  		},
  	])
  	.outputOptions("-shortest")
    .videoCodec("libvpx-vp9")
    .format("webm")
   //	.output(stream)
    .pipe(res)
  	//.run();
  }
});
// var stream = fs.createWriteStream(path.join(__dirname, "/uploads/video/wwwwwww.webm"));

// Modifica video
router.post('/modificaVideo',  module.exports.uploader().single("audio"), async (req,res)=>{
    var buffer = Buffer.from(req.body.audio, 'base64');
    var readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);

    var command = ffmpeg(readable)
        .format('webm')
        .setStartTime(req.query.start)
        .setDuration(req.query.end)
        .audioFilters('volume=' + (req.query.volume/10))
        .on('end', function() {
            console.log('file has been modified succesfully');
        })
        .on('error', function(err) {
            console.log('an error happened: ' + err.message);
        });

    var ffstream = command.pipe();
    var chunks = [];
    ffstream.on('data', function(chunk) {
        chunks.push(chunk);
    });
    ffstream.on('end', function() {
        var result = Buffer.concat(chunks);
        res.send(result.toString('base64'));
    });
  });

module.exports.routeAV = router;
