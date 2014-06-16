({
init: function (cmp) {
        
        var totalItems = cmp.get('v.pageSize')* cmp.get("v.totalPages");
        cmp.set('v.totalItems', totalItems);
    },

    handleProvide: function (cmp, evt, hlp) {
        var currentPage = cmp.get('v.currentPage'),
            pageSize = cmp.get('v.pageSize'),
            sortBy = cmp.get('v.sortBy'),
            tasks = hlp.createTasks(cmp, currentPage, pageSize),
            column = sortBy, 
            ascending = true;
        
        if (column && column.indexOf('-') === 0) {
            column = sortBy.slice(1);
            ascending = false;
        }

        if (column) {
            hlp.sort(tasks, column, ascending);
        }

        hlp.fireDataChangeEvent(cmp, tasks);
    }
})