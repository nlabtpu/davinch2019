var socket_io = require('socket.io');



function socket(srv) {
  var io = socket_io.listen(srv);
  io.sockets.on('connection', function (socket) {
    console.log('connected');
    socket.on('message', d => io.emit('receiveMessage', d));
    const id = socket.id;
    socket.on('demo' + id, d => io.emit('receive' + id, d))
  });
      socket.on('client_to_server_personal', function(data) {
        var id = socket.id;
        name = data.value;
        var personalMessage = "あなたは、" + name + "さんとして入室しました。"
        io.to(id).emit('server_to_client', {value : personalMessage})
    });
}

module.exports = socket;