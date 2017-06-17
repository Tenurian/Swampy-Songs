/**
 * Created by tfeue on 5/19/2017.
 */
var express = require('express');
var mongoose = require('mongoose');
/*replace the url with the new mlab database*/
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
    name: {type: String, required: true},
    url: {type: String, required: true},
    votes: { type: Number, default: 1 },
    dateCreated: Date,
    pingu: String
});
var Song = mongoose.model('Song', SongSchema);

var AdminSchema = Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});
var Admin = mongoose.model('Admin', AdminSchema);

(function () {
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

    var Administrators = [
        {
            username: 'admin',
            password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
        },
        {
            username: 'IndiaVenom',
            password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
        },
        {
            username: 'Tenurian',
            password: '64368cd484f6bbebb03878cff20476b6d28139a7172eb3cad0f995391a8962ee'
        }
    ];

    TempSong.forEach(function (dummySong) {
        Song.findOne({name: dummySong.name}).exec(function (err, song) {
            if(err) throw err;
            if(!song){
                var newSong = new Song(dummySong);
                newSong.save(function (err) {
                    if(err) throw err;
                    console.log('Saved new song!');
                });
            }
        });
    });

    Administrators.forEach(function(admin){
        Admin.findOne({username: admin.username}).exec(function (err, found) {
            if(err) throw err;

            if(!found){
                var newAdmin = new Admin(admin);
                newAdmin.save(function (err) {
                    if(err) throw err;
                    console.log('New Admin saved');
                });
            }
        })
    });

})();

module.exports = {
    User: User,
    Song: Song,
    Admin: Admin
};
