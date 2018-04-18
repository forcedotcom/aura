/* global download */
/* exported saveTests */

var MIME = "data:text/csv;charset=utf-8,";
var EXT = ".csv";
var HEADERS = [
  "group",
  "test",
  "state",
  "hz",
  "mean",
  "stddev",
  "rme",
  "n",
  "sample"
];
var CR = "\r\n";

function saveTests(plan, filename) {
  var csv = HEADERS.join(",") + CR;

  if (plan) {
    plan.forEach(function(test) {
      if (test.suite) {
        test.suite.forEach(function(bench) {
          csv += [test.group, test.name, bench.name, bench.hz].join(",");
          var stats = bench.stats;
          csv += "," + [stats.mean, stats.deviation, stats.rme].join(",");
          var sample = stats.sample;
          csv += "," + sample.length;
          csv += "," + sample.join(",");
          csv += CR;
        });
      }
    });
  }

  download(MIME, csv, filename, EXT);
}
