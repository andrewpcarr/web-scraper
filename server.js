// Dependencies
const express = require("express");
const mongojs = require("mongojs");

const request = require("request");
const cheerio = require("cheerio");

const app = express();

const databaseUrl = "scraper";
let collections = ["scrapedData"];

// Connecting mongojs config to db variable
const db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route
app.get("/", function(req, res) {
  res.send("NPR -- 13.7 Cosmos and Culture. Visit <a href='localhost:3000/scrape'>/scrape</a> to run a fresh scrape, then head over to <a href='localhost:3000/all'>/all</a> to see the results.");
});

// jQuery('a').on('click', function() {
//   window.location.replace($(this).attr('href'));
// });

// Display scraped data
app.get("/all", function(req, res) {
  db.scrapedData.find({}, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});

// Scrape data
app.get("/scrape", function(req, res) {
  request("http://www.npr.org/sections/13.7/", function(error, response, html) {
    const $ = cheerio.load(html);
    $('div.item-info').each(function(i, element) {
      let title = $(this).children('h2.title').children('a').text();
      let link = $(this).children('h2.title').children('a').attr('href');

      if (title && link) {
        db.scrapedData.save({
          title: title,
          link: link
        },
        function(error, saved) {
          if (error) {
            console.log(error);
          }
          else {
            console.log(saved);
          }
        });
      }
    });
  });

  res.send("Scrape Complete");
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
