// Measure the cost of rendering components.

function renderChartComponentTest(count, validate) {
  var descriptor = this.api.isLockerEnabled
    ? "markup://lockerPerformance:testChartSecure"
    : "markup://lockerPerformance:testChart";

  var n = 12;
  var data = [
    Array.apply(null, { length: n }).map(function(x, i) {
      return 10 * i;
    }),
    Array.apply(null, { length: n }).map(function(x, i) {
      return 10 * i + 5;
    })
  ];

  var config = { descriptor: descriptor, attributes: { data: data } };
  var cmp = this.api.create(config);

  var els;
  while (count--) {
    els = this.api.render(cmp);
  }

  if (validate) {
    var canvas = els[0];
    var actual = canvas.toDataURL();
    var blank = document.createElement("canvas");

    blank.width = canvas.width;
    blank.height = canvas.height;
    var expected = blank.toDataURL();

    this.api.assert(actual === expected, expected, actual);
  }

  cmp.destroy();
}
