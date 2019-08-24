//Requiring dependencies

var express = require("express");
var router = express.Router();
var path = require("path");

var request = require("request");
var cheerio = require("cheerio");

//Requiring models

var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

//Creating index route
//using router package for this

router.get("/", function(req, res) {
    res.redirect("/articles");
  });

// Creating GET request to scrape the verge website
//Then load information retrieved into cheerio and save it into the selector

  router.get("/scrape", function(req, res) {
    request("http://www.theverge.com", function(error, response, html) {
      var $ = cheerio.load(html);
      var titlesArray = [];

//function that will grab every article using the class tag from the site
//adding text and href of every link and saving it as a result.
  
      $(".c-entry-box--compact__title").each(function(i, element) {
        var result = {};
  
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");

//Adding conditions to check for empty and duplicates before pushing to database

        if (result.title !== "" && result.link !== "") {
          if (titlesArray.indexOf(result.title) == -1) {
            titlesArray.push(result.title);
  
            Article.count({ title: result.title }, function(err, test) {
              if (test === 0) {
                var entry = new Article(result);
  
                entry.save(function(err, doc) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(doc);
                  }
                });
              }
            });
          } else {
            console.log("Article already exists.");
          }
        } else {
          console.log("Not saved to Database, missing data");
        }
      });
      res.redirect("/");
    });
  });

//end of function that pulls from class tag

//Grabbing articles and they will populate to the DOM in the /articles endpoint

  router.get("/articles", function(req, res) {
    Article.find()
      .sort({ _id: -1 })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          var artcl = { article: doc };
          res.render("index", artcl);
        }
      });
  });
  
 //Creating an articles json route that will get the article scraped from the mongo database into a json
  
  router.get("/articles-json", function(req, res) {
    Article.find({}, function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.json(doc);
      }
    });
  });
  
  router.get("/clearAll", function(req, res) {
    Article.remove({}, function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("removed all articles");
      }
    });
    res.redirect("/articles-json");
  });
  
  router.get("/readArticle/:id", function(req, res) {
    var articleId = req.params.id;
    var hbsObj = {
      article: [],
      body: []
    };
  
    Article.findOne({ _id: articleId })
      .populate("comment")
      .exec(function(err, doc) {
        if (err) {
          console.log("Error: " + err);
        } else {
          hbsObj.article = doc;
          var link = doc.link;
          request(link, function(error, response, html) {
            var $ = cheerio.load(html);
  
            $(".l-col__main").each(function(i, element) {
              hbsObj.body = $(this)
                .children(".c-entry-content")
                .children("p")
                .text();
  
              res.render("article", hbsObj);
              return false;
            });
          });
        }
      });
  });
  router.post("/comment/:id", function(req, res) {
    var user = req.body.name;
    var content = req.body.comment;
    var articleId = req.params.id;
  
    var commentObj = {
      name: user,
      body: content
    };
  
    var newComment = new Comment(commentObj);
  
    newComment.save(function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log(doc._id);
        console.log(articleId);
  
        Article.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { comment: doc._id } },
          { new: true }
        ).exec(function(err, doc) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/readArticle/" + articleId);
          }
        });
      }
    });
  });
  
  module.exports = router;