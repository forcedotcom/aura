({
    add: function (cmp) {
        var list = cmp.find('list'),
            task = {
            ActivityDate: "2013-08-27",
            IsClosed: false,
            Id: "Client"
        };

        list.getValue('v.items').insert(0, task);
    },
    remove: function (cmp) {
        var list = cmp.find('list');

        list.getValue('v.items').remove(1);
    }

})