({
  init: function(cmp, event, helper) {
    var groups = helper.harness.constants.GROUPS;
    var plan = helper.harness.createTestPlan(groups, helper);
    cmp.set("v.plan", plan);
  }
});
