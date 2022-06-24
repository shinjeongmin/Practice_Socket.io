var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
const debug = io.of('/debug');

app.get('/', function(req, res){
    var options = {
        root: path.join(__dirname)
    };
     
    var fileName = 'index.html';
    res.sendFile(fileName, options);
});

io.on('connection', (socket) => {
    socket.emit('usercount', io.engine.clientsCount); // usercount 호출 시 client 수를 보냄

    //시작시 default 룸에 입장
    socket.join("채팅방 1");

    socket.on('message', (msg, roomname) => {
        console.log('Message received: ' + msg); // msg는 client에서 보낸 매개변수가 옴

        io.to(roomname).emit('message', msg); // 특정 룸의 소켓들에만 신호를 보냄
    });

    socket.on('joinRoom', (roomname, roomToJoin)=>{
        socket.leave(roomname); // 기존 룸을 나가고
        socket.join(roomToJoin); // 들어갈 룸에 join

        socket.emit('roomChanged', roomToJoin); // 룸을 전환하였음을 알림
    });
});

debug.on('connection', (socket) =>{

    socket.on('getRooms', ()=>{
        socket.emit('rooms', Array.from(io.sockets.adapter.rooms.keys()));
    });
});

server.listen(3000, function() {
  console.log('Listening on http://localhost:3000/');
});