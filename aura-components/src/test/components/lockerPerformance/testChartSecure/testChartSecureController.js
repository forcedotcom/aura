({
  init: function(cmp, event, helper) {
    helper.init();

    var data = cmp.get("v.data");
    if ($A.util.isEmpty(data)) {
      var n = 12;
      data = [
        Array.apply(null, { length: n }).map(function(x, i) {
          return 10 * i;
        }),
        Array.apply(null, { length: n }).map(function(x, i) {
          return 10 * i + 5;
        })
      ];
      cmp.set("v.data", data);
    }
  }
});
