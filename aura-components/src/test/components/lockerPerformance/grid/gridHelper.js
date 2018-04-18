({
  getSelected: function(cmp, localId) {
    var selectCmp = cmp.find(localId);
    var select = selectCmp.getElement();
    var index = select.selectedIndex;
    // Always skip first value
    return index > 0 ? select.options[index].value : undefined;
  },

  setSelected: function(cmp, localId, index) {
    var selectCmp = cmp.find(localId);
    var select = selectCmp.getElement();
    select.selectedIndex = index;
  },

  setDisabled: function(cmp, localId, isDisabled) {
    var controlCmp = cmp.find(localId);
    var control = controlCmp.getElement();
    control.disabled = isDisabled;
  },

  selectGroup: function(cmp) {
    this.setSelected(cmp, "name", 0);
  },

  selectName: function(cmp) {
    this.setSelected(cmp, "group", 0);
  },

  run: function(cmp) {
    this.setDisabled(cmp, "group", true);
    this.setDisabled(cmp, "name", true);
    this.setDisabled(cmp, "run", false);
    this.setDisabled(cmp, "save", true);

    var plan = cmp.get("v.plan");
    var filterGroup = this.getSelected(cmp, "group");
    var filterTest = this.getSelected(cmp, "name");
    var element = cmp.find("grid").getElement();

    var that = this;
    function doneTests() {
        that.setDisabled(cmp, "group", false);
        that.setDisabled(cmp, "name", false);
        that.setDisabled(cmp, "run", false);
        that.setDisabled(cmp, "save", false);
    }

    this.harness.runTests(plan, filterGroup, filterTest, element, doneTests);
  },

  save: function(cmp) {
    var plan = cmp.get("v.plan");
    var filename = ["Benchmark Data", new Date().toString()].join(" ");
    this.harness.saveTests(plan, filename);
  }
});
