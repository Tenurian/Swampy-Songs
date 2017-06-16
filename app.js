var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./db');

var app = express();

var PORT = (process.env.port || '8080');

app.set('port', PORT);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/pull', function (req, res) {
    console.log('/pull');
    db.User.findOne({IP: req.connection.remoteAddress}).exec(function (err, user) {
        if(err) throw err;
        if(!user){
            user = new db.User({
                IP: req.connection.remoteAddress,
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
            console.log('User: ', user);
            console.log('Songs: ', songs);
            res.send(JSON.stringify({
                user: user,
                songs: songs
            }));
        });

    });
});

app.post('/vote', function(req, res){
    console.log('/vote');
    var song_id = req.body.song_id;


    db.User.findOne({IP: req.connection.remoteAddress}).exec(function (err, user) {
        if (err) throw err;
        if(!user){
            user = new db.User({
                IP: req.connection.remoteAddress,
                votes: []
            });
            user.save(function(err){
                if(err) throw err;
                console.log('New user added');
            });
        }
        db.Song.findOne({_id: song_id}).exec(function (err, song) {
            if(err) throw err;
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
                            console.log('User: ', user);
                            console.log('Songs: ', songs);
                            res.send(JSON.stringify({
                                user: user,
                                songs: songs
                            }));
                        });
                    });
                });
            } else {
                res.sendStatus(404);
            }
        })
    })
});

app.use('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT);
console.log('Listening on port: ', PORT);