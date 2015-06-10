({
init: function (cmp) {
        var totalItems = cmp.get('v.pageSize')* cmp.get("v.totalPages");
        cmp.set('v.totalItems', totalItems);
    },

    handleProvide: function (cmp, evt, hlp) {
        var currentPage = cmp.get('v.currentPage'),
            pageSize = cmp.get('v.pageSize'),
            tasks = hlp.createTasks(cmp, currentPage, pageSize);
        hlp.fireDataChangeEvent(cmp, tasks);
    }
})