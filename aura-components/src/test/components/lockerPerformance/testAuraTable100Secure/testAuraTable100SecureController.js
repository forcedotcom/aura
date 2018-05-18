({
  init: function(cmp) {

      var rows = 100;
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
