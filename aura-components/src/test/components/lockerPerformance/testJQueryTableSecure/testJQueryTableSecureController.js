({
  init: function(cmp, event, helper) {
      helper.init();

      var rows = 10;
      var months = [
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

      var headers = months;

      var content = [];
      for (var i = 0; i < rows; i++) {
        var row = [];
        for (var j = 0; j < months.length; j++) {
          var col = 12 * i + j + 1;
          row.push(col);
        }
        content.push(row);
      }

      cmp.set("v.headers", headers);
      cmp.set("v.content", content);
    }
  }
})
