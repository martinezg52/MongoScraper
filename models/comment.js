//Requiring dependency

var mongoose = require("mongoose");

//creating schema for Comments Collection

var Schema = mongoose.Schema;
var commentsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    
})

var comment = mongoose.model("Comment", articleSchema);

module.exports = article;