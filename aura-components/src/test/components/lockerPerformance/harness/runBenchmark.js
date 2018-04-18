/* global constants, api, createSuite */
/* exported runBenchmark */

var OPTIONS = {
  async: true
};

function runBenchmark(test, update, done) {
  // Create a secure version of the test function.
  var func = test.func;
  var src = func.toString();
  var secureFunc = $A.lockerService.runScript(
    "(function(){ return " + src + " })()",
    constants.NAMESPACE
  );

  // Validate test and lockerized test functions.
  func.call({ api: api.unsecure }, 1, true);
  secureFunc.call({ api: api.secure }, 1, true);

  // Run the benchmark.

  var suite = createSuite();
  test.suite = suite;

  suite
    .add("Locker OFF", func, { api: api.unsecure })
    .add("Locker ON", secureFunc, { api: api.secure })
    .on("start", function() { update(test) })
    .on("cycle", function() { update(test) })
    .on("complete", done)
    .run(OPTIONS);
}
