/* exported createTestPlan */

function createTestPlan(groups, tests) {
  var plan = [];
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];

    var lib = tests[group];

    var names = Object.keys(lib);
    for (var j = 0; j < names.length; j++) {
      var name = names[j];
      var func = lib[name];
      plan.push({ group: group, name: name, func: func });
    }
  }
  return plan;
}
