// Measure the cost of
// adding members to an object, and iterating over them.
/* exported loopX10ObjectTest */

function loopX10ObjectTest(count, validate) {
  var n = 10;

  var obj = this.api.wrap({});
  for (var i = 0; i < n; i++) {
    var key = "x" + i;
    obj[key] = i;
  }

  while (count--) {
    obj["x0"];
    obj["x1"];
    obj["x2"];
    obj["x3"];
    obj["x4"];
    obj["x5"];
    obj["x6"];
    obj["x7"];
    obj["x8"];
    obj["x9"];
  }

  if (validate) {
    var expected = 5;
    var actual = obj["x5"];
    this.api.assert(actual === expected, expected, actual);
  }
}
