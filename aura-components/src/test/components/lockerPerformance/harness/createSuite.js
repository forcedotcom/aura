// Benchmark.js evaluates source using script elements, which is
// incompatible with Aura's unsafe-inline. We create an empty context
// to force Benchmark.js to ignore the DOM API ans use eval().

/* global Benchmark */
/* exported createSuite */

function createSuite() {
  // Prevent Benchmark from using inline script tags and break CSP rules.
  var context = { document: null };
  var ContextBenchmark = Benchmark.runInContext(context);
  return new ContextBenchmark.Suite();
}
