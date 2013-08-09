var x = require("express");
var y = x();

y.use(x.static(__dirname));

y.listen(9977);
