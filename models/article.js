//requiring dependency

var mongoose = require("mongoose");

//creating schema for Article Collection

var Schema = mongoose.Schema;
var articleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
})

var article = mongoose.model("Article", articleSchema);

module.exports = article;