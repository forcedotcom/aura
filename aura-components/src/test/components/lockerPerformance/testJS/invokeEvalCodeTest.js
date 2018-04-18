// Measure the cost of evalutation.
/* exported invokeEvalCodeTest */

function invokeEvalCodeTest(count, validate) {
  function fn() {
    var obj = JSON.parse('{"foo":1, "bar": 2}');
    var keys = Object.keys(obj);
    return keys.length;
  }

  var src = fn.toString();
  var fn2 = this.api.eval("(" + src + ")");

  while (count--) {
    fn2();
  }

  if (validate) {
    var expected = fn();
    var actual = fn2();
    this.api.assert(actual === expected, expected, actual);
  }
}
