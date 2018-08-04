// Measure the cost of accessing elements in a NodeList.
/* exported querySelectorAll10 */

function querySelectorAll10(count, validate) {
    var rows = 10;
    var cols = 12
    var table = document.createElement("table");
    table.classList.add('white');

    var tbody = document.createElement("tbody");
    for (var i = 0; i < rows; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < cols; j++) {
            var td = document.createElement("td");
            td.innerText = cols * i + j + 1;
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    document.body.appendChild(table);

    var nodes = document.querySelectorAll('table.white tbody tr');
    // We want to measure the cost of accessing items n times in the nodelist  and the while loop is accessing the first 10 indexes in the nodelist,
    // divide the count by 10 times
    var loop = rows * count / 10;
    while (loop--) {
        nodes[0],
        nodes[1],
        nodes[2],
        nodes[3],
        nodes[4],
        nodes[5],
        nodes[6],
        nodes[7],
        nodes[8],
        nodes[9]
    }

    if (validate) {
        var expected = rows;
        var actual = nodes.length;
        this.api.assert(actual === expected, expected, actual);
    }
    document.body.removeChild(table);
}