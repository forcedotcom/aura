// Measure the cost of
// adding items to an array, an iterating over it.
/* exported loopX100ArrayTest */

function loopX100ArrayTest(count, validate) {
  var n = 100;

  var arr = this.api.wrap([]);
  for (var i = 0; i < n; i++) {
    arr.push(i);
  }

  var loop = (n * count) / 10;
  while (loop--) {
    arr[0];
    arr[1];
    arr[2];
    arr[3];
    arr[4];
    arr[5];
    arr[6];
    arr[7];
    arr[8];
    arr[9];
  }

  if (validate) {
    var expected = n;
    var actual = arr.length;
    this.api.assert(actual === expected, expected, actual);
  }
}
