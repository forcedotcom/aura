// Measure the cost of cloning a subtree.
/* exported cloneNodeTest */

function cloneNodeTest(count, validate) {

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
    document.body.appendChild(table);
    var queriedTable = document.querySelector('table');

    var clonedTable
    while (count--) {
        queriedTable.cloneNode(true);
        queriedTable.cloneNode(true);
        queriedTable.cloneNode(true);
        queriedTable.cloneNode(true);
        clonedTable = queriedTable.cloneNode(true);
    }

    if (validate) {
        var expected = 120;
        var actual = clonedTable.querySelectorAll("td").length;
        this.api.assert(actual === expected, expected, actual);
    }
    document.body.removeChild(table);
}