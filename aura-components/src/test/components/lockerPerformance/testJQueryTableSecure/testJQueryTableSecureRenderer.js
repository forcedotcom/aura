({
  afterRender: function(cmp, helper) {
    this.superAfterRender();

    var headers = cmp.get("v.headers");
    var content = cmp.get("v.content");

    var table = $("<table/>");
    var thead = $("<thead/>");
    var tr = $("<tr/>");
    for (var i = 0; i < headers.length; i++) {
      var th = $("<th>" + headers[i] + "</th>");
      tr.append(th);
    }
    thead.append(tr);
    table.append(thead);

    var tbody = $("<tbody/>");
    for (var i = 0; i < content.length; i++) {
      var tr = $("<tr/>");
      var cells = content[i];
      for (var j = 0; j < cells.length; j++) {
        var td = $("<td>" + cells[j] + "</td>");
        tr.append(td);
      }
      tbody.append(tr);
    }
    table.append(tbody);

    var container = cmp.find("container").getElement();
    container.innerHTML = "";
    table.appendTo(container);
  }
});
