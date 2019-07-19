var socket_io = require('socket.io');
io.sockets.on('connection', function(socket) {
//この中に書くよ

var socket_id = socket.id;


});

function socket(srv) {
  var io = socket_io.listen(srv);
  io.sockets.on('connection', function (socket) {
    console.log('connected');
    socket.on('message', d => io.emit('receiveMessage', d));
    const id = socket.id;
    socket.on('demo' + id, d => io.emit('receive' + id, d))
  });
}

module.exports = socket;