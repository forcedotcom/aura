// Measure the cost of rendering components.

function renderJQueryTableComponentTest(count, validate) {
  var descriptor = this.api.isLockerEnabled
    ? "markup://lockerPerformance:testJQueryTableSecure"
    : "markup://lockerPerformance:testJQueryTable";

  // Create a 25x25 array.
  var cols = ["a", "b", "c", "d", "e"];
  var rows = [cols, cols, cols, cols, cols];
  var config = {
    descriptor: descriptor,
    attributes: { headers: cols, content: rows }
  };

  var cmp = this.api.create(config);

  var els;
  while (count--) {
    els = this.api.render(cmp);
  }

  if (validate) {
    var expected = 25;
    var table = els[0];
    var actual = table.querySelectorAll("td").length;
    this.api.assert(actual === expected, expected, actual);
  }

  cmp.destroy();
}
