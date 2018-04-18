// Measure the cost of evalutation.
/* exported evalTest */

function evalTest(count, validate) {
  function fn() {
    var obj = JSON.parse('{"foo":1, "bar": 2}');
    var keys = Object.keys(obj);
    return keys.length;
  }
  var src = "(" + fn.toString() + ")()";

  while (count--) {
    this.api.eval(src);
  }

  if (validate) {
    var expected = fn();
    var actual = this.api.eval(src);
    this.api.assert(actual === expected, expected, actual);
  }
}
