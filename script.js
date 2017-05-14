var sphero = require("sphero")

// var ble = "f5:c1:8b:5c:b4:93";
var ble = "e7:e0:fe:50:58:bd";
var orb = sphero(ble); // change BLE address accordingly

var express = require("express");
var app     = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path    = require("path");

app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('keydown left', function() {
    orb.roll(50, 270);
  });

  socket.on('keydown up', function() {
    orb.roll(50, 0);
  });

  socket.on('keydown right', function() {
    orb.roll(50, 90);
  });

  socket.on('keydown down', function() {
    orb.roll(50, 180);
  });
});

/*
  POSTS
*/

app.post('/', function(req, res) {
  roll();
});

app.post('/disconnect', function(req, res) {
  //orb.readLocator();
  disconnect();
});

app.post('/startCalibration', function(req, res) {
  orb.startCalibration();
});

app.post('/finishCalibration', function(req, res) {
  orb.finishCalibration();
});


http.listen(3000);

function roll() {
  orb.roll(150, 0);
}

function disconnect() {
  orb.disconnect(function() {
    console.log("dc");
  });
}

function connect() {
  orb.connect(function() {

   orb.color("green");
   orb.detectCollisions();
//   orb.streamAccelerometer();
   orb.streamGyroscope(45);
   orb.streamVelocity(45);

   // Checks for collision
   orb.on("collision", function(data) {
       orb.color("red")
         .delay(100)
         .then(function() {
           io.emit('canvas clear');
           return orb.color("green");
         });
   });

   orb.on("velocity", function(data) {
     io.emit('velocity', data);
   });

   orb.on("gyroscope", function(data) {
     io.emit('gyroscope', data);
   });

  //  orb.on("imuAngles", function(data) {
  //    io.emit('imuAngles', data);
  //    console.log("pitch: " + data.pitchAngle.value[0]);
  //    console.log("roll: "  + data.rollAngle.value[0]);
  //    console.log("taw: " + data.yawAngle.value[0]);
  //  });
  //  orb.on("gyroscope", function(data) {
  //    console.log("X:" + data.xGyro.value[0] +
  //               " Y: " + data.yGyro.value[0] +
  //               " Z: " + data.zGyro.value[0]);
  //  });

  //  orb.on("accelerometer", function(data) {
  //     console.log(data.xAccel.value);
  // });
 });
}

connect();

console.log("It's running...");
