const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

users = [];

port = 5000;
host = 'localhost';
serverId = ''

io.on('connection', socket => {
    socket.on('username', (username) => {
        users.push({
            id: socket.id,
<<<<<<< HEAD
            username: username.toUpperCase()
        })
        console.log(username.toUpperCase() + " joined");
        console.log(users);

        socket.to(serverId).emit('userJoined', username.toUpperCase());
=======
            username: username
        })
        console.log(username + " joined");
        console.log(users);

        socket.to(serverId).emit('userJoined', username);
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137
    });

    socket.on('serverJoin', () => {
        serverId = socket.id;
        console.log("server joined");
        console.log(serverId);
    });

    socket.on('disconnect', function () {
        console.log("user disconnected");
    });

    socket.on('playerVote', (vote) => {
        console.log("vote recieved " + vote);
        socket.to(serverId).emit('playerVoted', vote);
    });

    socket.on('playMatch', (match) => {
        console.log("Match Started");
        socket.broadcast.emit('playMatch', match);
    });

    socket.on('matchOver', (standings) => {
        console.log("winner is: " + standings[standings.length - 1]);
        socket.broadcast.emit('matchOver', standings);
    })
});

http.listen(port, () => {
    console.log("started on port " + port);
});