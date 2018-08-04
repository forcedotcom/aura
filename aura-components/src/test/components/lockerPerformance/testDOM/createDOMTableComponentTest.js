// Measure the cost of creating Aura components.
/* exported createDOMTableComponentTest */

function createDOMTableComponentTest(count, validate) {

  var descriptor = this.api.isLockerEnabled
    ? "markup://lockerPerformance:testDOMTableSecure"
    : "markup://lockerPerformance:testDOMTable";

  var config = {descriptor: descriptor};

  while (count--) {
    var cmp = this.api.create(config);
    cmp.destroy();
  }

  if (validate) {
    var expected = 120;
    var cmp = this.api.create(config);
    var els = this.api.render(cmp);
    var table = els[0];
    var actual = table.querySelectorAll("td").length;
    cmp.destroy();
  }
}
