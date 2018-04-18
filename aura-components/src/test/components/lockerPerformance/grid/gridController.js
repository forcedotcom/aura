({
  init: function(cmp, event, helper) {
    cmp.set("v.groups", helper.harness.constants.GROUPS);
  },
  selectGroup: function(cmp, event, helper) {
    helper.selectGroup(cmp);
  },
  selectName: function(cmp, event, helper) {
    helper.selectName(cmp);
  },
  run: function(cmp, event, helper) {
    helper.run(cmp);
  },
  save: function(cmp, event, helper) {
    helper.save(cmp);
  }
});
