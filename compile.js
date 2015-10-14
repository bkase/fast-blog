const posts = ['crumpets-and-godels-t.md', 'exploiting-temporal-locality-with-zsh.md', 'adb-to-the-firefox-process.md', 'obligatory-blog-about-blog.md'];
const marked = require("marked");
marked.setOptions({
  highlight: function (code) {
               return require('highlight.js').highlightAuto(code).value;
             }
});

const $ = require("cheerio");

const dustfs = require("dustfs");
const fs = require("fs");
dustfs.dirs('templates');

var mostRecent = [];
posts.forEach(function(post, i) {
  var mdData = fs.readFileSync(post);
  var html = marked(mdData.toString());
  var title = $('h1', html);
  var intro = title.next();
  var htmlName = post.replace(/\.md/, ".html");
  if (i < 7) {
    mostRecent.push({ intro: title.toString() + intro.toString(), href: htmlName});
  }

  dustfs.render('a-post.dust', { compiled: html }, function(err, out) {
    fs.writeFileSync("www/" + htmlName, out);
  });
});

dustfs.render('homepage.dust', { intros: mostRecent }, function(err, out) {
  fs.writeFileSync("www/index.html", out);
});

