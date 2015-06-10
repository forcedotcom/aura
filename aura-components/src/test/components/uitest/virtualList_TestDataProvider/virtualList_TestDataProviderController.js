({
init: function (cmp) {
        var totalItems = cmp.get('v.pageSize')* cmp.get("v.totalPages");
        cmp.set('v.totalItems', totalItems);
    },

    handleProvide: function (cmp, evt, hlp) {
        var currentPage = cmp.get('v.currentPage'),
            pageSize = cmp.get('v.pageSize'),
            items = hlp.createItems(cmp, currentPage, pageSize);
        hlp.fireDataChangeEvent(cmp, items);
    }
})