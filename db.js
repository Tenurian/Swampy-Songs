/**
 * Created by tfeue on 5/19/2017.
 */
var express = require('express');
var mongoose = require('mongoose');

// mongoose.connect('mongodb://production_user:production_password@ds139817.mlab.com:39817/psyke');
mongoose.connect('mongodb://127.0.0.1/my_database');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;

var UserSchema = Schema({
    IP: String,
    votes: [String]
});
var User = mongoose.model('User', UserSchema);

var SongSchema = Schema({
    name: String,
    url: String,
    votes: { type: Number, default: 1 }
});

var Song = mongoose.model('Song', SongSchema);

(function () {
    // var PublicRoom = {
    //     room_name: 'Public Room',
    //     online_members: [],
    //     log: []
    // };
    var TempSong = [
        {
            name: 'No Problem',
            url: 'https://www.youtube.com/watch?v=Z_uO6NuKOuk',
            votes: 100
        },
        {
            name: 'Snowcone',
            url: 'https://www.youtube.com/watch?v=amBBO4PqJKo',
            votes: 100
        },
        {
            name: 'Future Starts Slow',
            url: 'https://www.youtube.com/watch?v=KiLjuRG3hoE',
            votes: 50
        },
        {
            name: 'Barbarianism',
            url: 'https://www.youtube.com/watch?v=lKvpo7Ma9JM',
            votes:0
        }
    ];

    // for(var i = 0; i < TempSong.length; i++){
    //     var dummySong = TempSong[i];
    TempSong.forEach(function (dummySong) {
        // console.log('dummySong: ', dummySong);
        Song.findOne({name: dummySong.name}).exec(function (err, song) {
            if(err) throw err;
            // console.log('song: ', song);
            if(!song){
                var newSong = new Song(dummySong);
                newSong.save(function (err) {
                    if(err) throw err;
                    console.log('Saved new song!');
                });
            }
        });
    });
    // }

    // Song.find({}).sort({votes: -1}).exec(function(err, songs){
    //     if(err) throw err;
    //     console.log(songs);
    // });
    // Room.findOne({room_name: PublicRoom.room_name}).exec(function(err, room){
    //     if(err) throw err;
    //     if(room){
    //         console.log(room.room_name,' already exists.');
    //     } else {
    //         var room_inst = new Room(PublicRoom);
    //         room_inst.save(function(err){
    //             if(err) throw err;
    //             console.log("Saved the room '"+PublicRoom.room_name+"'");
    //         })
    //     }
    // });

})();

module.exports = {
    User: User,
    Song: Song
};
