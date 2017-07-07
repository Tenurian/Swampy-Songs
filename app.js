var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./db');

server.listen(8082);
var PORT = (process.env.port || '8080');

app.set('port', PORT);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/admin.html'));
});
app.post('/changePassword', function (req,res) {
   var oldPassword = req.body.oldPassword;
   var newPassword = req.body.newPassword;

   req.sendStatus(503);

});
app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(username);
    console.log(password);

    db.Admin.findOne({username: username}).exec(function(err, admin){
        if(err) throw err;
        console.log(admin);
        console.log(admin.password === password);

        if(admin.password === password){
            res.send(JSON.stringify({
                user: admin
            }));
        } else {
            res.sendStatus(403);
        }
    });
    // res.sendStatus(418);
});

io.on('connection', function (socket) {
    console.log('user connected');
    var ip = socket.handshake.address;
    console.log('socket.handshake.address: ', ip);
    db.User.findOne({IP: ip}).exec((err, user) => {
        if(err) throw err;
        if(!user){
            user = new db.User({
                IP: ip,
                votes: []
            });
            user.save(function(err){
                if(err) throw err;
                console.log('New user added');
            });
        } else {
            console.log('Getting existing user...');
        }

        db.Song.find({}).sort({votes: -1}).exec(function(err, songs){
            if(err) throw err;
            console.log('emit: load_data');
            socket.emit('load_data', {
                user: user,
                songs: songs
            });
        });

    });
    socket.on('vote', (song_id) => {
        console.log('vote');
        console.log(song_id);
        db.User.findOne({IP: ip}).exec(function (err, user) {
            if (err) throw err;
            console.log(user);
            if(!user){
                user = new db.User({
                    IP: ip,
                    votes: []
                });
                user.save(function(err){
                    if(err) throw err;
                    console.log('New user added');
                });
            }
            db.Song.findOne({_id: song_id}).exec(function (err, song) {
                if(err) throw err;
                console.log(song);
                if(song){
                    if(user.votes.indexOf(song._id) === -1){
                        song.votes++;
                        user.votes.push(song._id);
                    } else {
                        song.votes--;
                        user.votes.splice(user.votes.indexOf(song._id), 1);
                    }
                    user.markModified('propChanged');
                    song.save(function(err){
                        if(err) throw err;
                        user.save(function(err){
                            if(err) throw err;
                            db.Song.find({}).sort({votes: -1}).exec(function(err, songs){
                                if(err) throw err;
                                console.log(songs);
                                // console.log('User: ', user);
                                // console.log('Songs: ', songs);
                                io.sockets.emit('update', {
                                    user: user,
                                    songs: songs
                                });
                            });
                        });
                    });
                } else {
                    res.sendStatus(404);
                }
            })
        })
    });
    socket.on('admin-update', (data) => {
        console.log(data);
        let {song} = data;
        db.Admin.findOne(data.user).exec((err, admin)=>{
            if(err) throw err;
            console.log('admin found!');
            console.log('song: '+JSON.stringify(song));
            db.Song.findOne({_id: song._id}).exec((err, s) => {
                if(err) throw err;
                console.log('s: ',s);
                s.name = song.name;
                s.url = song.url;
                s.votes = song.votes;
                s.save((err, hana) => {
                    if(err) throw err;
                    console.log('saved song: ',hana);
                    db.Song.find({}).sort({votes: -1}).exec(function(err, songs){
                        if(err) throw err;
                        console.log(songs);
                        socket.broadcast.emit('update', {
                            user: {IP: '', votes: []},
                            songs: songs
                        });
                    });
                });
            });
        });
    });
});

/*ALL OTHER GET/POST/USE FUNCTIONS GO ABOVE THIS LINE*/

app.use('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT);
console.log('Listening on port: ', PORT);