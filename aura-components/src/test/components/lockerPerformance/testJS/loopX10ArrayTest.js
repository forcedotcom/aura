// Measure the cost of
// adding items to an array, an iterating over it.
/* exported loopX10ArrayTest */

function loopX10ArrayTest(count, validate) {
  var n = 10;

  var arr = this.api.wrap([]);
  for (var i = 0; i < n; i++) {
    arr.push(i);
  }

  while (count--) {
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
    var expected = 5;
    var actual = arr[5];
    this.api.assert(actual === expected, expected, actual);
  }
}
