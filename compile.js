const posts = ['test.md', 'test2.md']
const marked = require("marked");
const $ = require("cheerio");

const dustfs = require("dustfs");
const fs = require("fs");
dustfs.dirs('templates');

var mostRecent = [];
posts.reverse().forEach(function(post, i) {
  var mdData = fs.readFileSync(post);
  var html = marked(mdData.toString());
  var title = $('h1', html);
  var intro = title.next();
  if (i < 7) {
    mostRecent.push({ intro: title.toString() + intro.toString() });
  }

  dustfs.render('a-post.dust', { compiled: html }, function(err, out) {
    fs.writeFileSync(post.replace(/\.md/, ".html"), out);
  });
});

dustfs.render('homepage.dust', { intros: mostRecent }, function(err, out) {
  fs.writeFileSync("homepage.html", out);
});

