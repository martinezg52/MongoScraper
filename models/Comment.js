//Requiring dependency

var mongoose = require("mongoose");

//creating schema for Comments Collection

var Schema = mongoose.Schema;
var CommentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    
})

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
