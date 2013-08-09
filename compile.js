const posts = ['test.md']
const marked = require("marked");

const dustfs = require("dustfs");
const fs = require("fs");
dustfs.dirs('templates');

posts.forEach(function(post) {
  mdData = fs.readFileSync(post);
  console.log(mdData.toString());
  dustfs.render('a-post.dust', { compiled: marked(mdData.toString()) }, function(err, out) {
    console.log(out);
    fs.writeFileSync(post.replace(/\.md/, ".html"), out);
  });
});

