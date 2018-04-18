({
  init: function(cmp, event, helper) {
    if (window.toString() === "[object Window]") {
      throw new Error("Locker is disabled");
    }

    helper.init();

    var headers = cmp.get("v.headers");
    var content = cmp.get("v.content");
    if ($A.util.isEmpty(headers) || $A.util.isEmpty(content)) {
      headers = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      var n = 10;
      content = Array.apply(null, { length: n }).map(function(x, i) {
        return Array.apply(null, { length: headers.length }).map(function(
          y,
          j
        ) {
          return 12 * i + j + 1;
        });
      });
      cmp.set("v.headers", headers);
      cmp.set("v.content", content);
    }
  }
});
