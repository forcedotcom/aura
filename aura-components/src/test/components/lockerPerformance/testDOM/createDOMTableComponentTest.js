// Measure the cost of creating Aura components.
/* exported createDOMTableComponentTest */

function createDOMTableComponentTest(count, validate) {
  var descriptor = this.api.isLockerEnabled
    ? "markup://lockerPerformance:testDOMTableSecure"
    : "markup://lockerPerformance:testDOMTable";

  // Create a 25x25 array.
  var cols = ["a", "b", "c", "d", "e"];
  var rows = [cols, cols, cols, cols, cols];
  var config = {
    descriptor: descriptor,
    attributes: { headers: cols, content: rows }
  };

  while (count--) {
    var cmp = this.api.create(config);
    cmp.destroy();
  }

  if (validate) {
    var expected = 1;
    var cmp = this.api.create(config);
    var els = this.api.render(cmp);
    var actual = els.length;
    this.api.assert(actual === expected, expected, actual);
    cmp.destroy();
  }
}
