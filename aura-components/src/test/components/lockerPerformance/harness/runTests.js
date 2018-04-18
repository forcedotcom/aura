/* global createTable, updateMetrics, runBenchmark*/
/* exported runTests */

var WAITING = "waiting...";

function filterTests(plan, filterGroup, filterTest) {
  return plan.filter(function(test) {
    return (!filterGroup || filterGroup === test.group) &&
      (!filterTest || filterTest === test.name);
  });
}

function clearTests(selection) {
  selection.forEach(function(test) {
    test.bench0 = WAITING;
    test.bench1 = WAITING;
    test.compare = WAITING;
  });
}

function runSequentially(getNext, run, update, done) {
  function check() {
    var test = getNext();
    if (test) {
      run(test, update, check);
    } else {
      done();
    }
  }
  check();
}

function renderPlan(element, plan) {
  if (element) {
    element.innerHTML = createTable(plan);
  }
}

function outputConsole(test) {
  console.log(
    "KPI:",
    test.group,
    test.name,
    "|",
    test.bench0,
    "|",
    test.bench1,
    "|",
    test.compare
  );
}

function runTests(plan, filterGroup, filterTest, element, done) {
  var selection = filterTests(plan, filterGroup, filterTest);

  // Benchmark
  function getNextTest() {
    return selection.shift();
  }
  function runTest(test, update, check) {
    runBenchmark(test, $A.getCallback(update), $A.getCallback(check));
  }
  function updateTest(test) {
    updateMetrics(test);
    outputConsole(test);
    renderPlan(element, plan);
  }

  clearTests(selection);
  runSequentially(getNextTest, runTest, updateTest, done);
}
