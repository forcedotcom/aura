({
    cloneNode: function(cmp) {
        var table = cmp.find("table_facetLocked").getElement();
        var tableClone = table.cloneNode(true);
        table.parentNode.appendChild(tableClone);
    }
})