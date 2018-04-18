({
  afterRender: function(cmp) {
    this.superAfterRender();

    var headers = cmp.get("v.headers");
    var content = cmp.get("v.content");

    var table = document.createElement("table");

    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    for (var i = 0; i < headers.length; i++) {
      var th = document.createElement("th");
      th.innerText = headers[i];
      tr.appendChild(th);
    }
    thead.appendChild(tr);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    for (var i = 0; i < content.length; i++) {
      var tr = document.createElement("tr");
      var cells = content[i];
      for (var j = 0; j < cells.length; j++) {
        var td = document.createElement("td");
        td.innerText = cells[j];
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    var container = cmp.find("container").getElement();
    container.innerHTML = "";
    container.appendChild(table);
  }
});
