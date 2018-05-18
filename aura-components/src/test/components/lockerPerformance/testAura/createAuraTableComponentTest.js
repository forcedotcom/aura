// Measure the cost of creating components.
/* exported createAuraTableComponentTest */

function createAuraTableComponentTest(count, validate) {

    var descriptor = this.api.isLockerEnabled ?
      "markup://lockerPerformance:testAuraTableSecure" :
      "markup://lockerPerformance:testAuraTable";

    var config = {descriptor: descriptor};

    while (count--) {
        var cmp = this.api.create(config);
        cmp.destroy();
    }

    if (validate) {
        var expected = 120;
        var els = this.api.render(cmp);
        var table = els[0];
        var actual = table.querySelectorAll("td").length;
        this.api.assert(actual === expected, expected, actual);
        cmp.destroy();
    }
}