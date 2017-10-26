({
    init: function(cmp, event, helper) {
        helper.createBody(cmp, 'body1');
    },

    toggleFlag: function (cmp, event, helper) {
        cmp.set('v.flag', !cmp.get('v.flag'));
    },

    toggleBody: function (cmp, event, helper) {
        var currentBody = cmp.get('v.body')[0];
        if (currentBody.get('v.literal') === 'body1') {
            helper.createBody(cmp, 'body2');
        } else if (currentBody.get('v.literal') === 'body2'){
            helper.createBody(cmp, 'body1');
        }
    },

    set: function (cmp, event, helper) {
        helper.createBody(cmp, 'body2');
    }
})
