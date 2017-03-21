({
    init: function () {
        window.testGetModules = function () {
            return window._simple = $A.getRoot().find('container').get('v.body')[0];
        }
    },

    toggle: function (cmp) {
        cmp.set('v.branch', !cmp.get('v.branch'));
    },
    updateTest: function (cmp, event, helper) {
        cmp.set('v.test', 'v.test | ' + helper._count++);
    },
    updateTest2: function (cmp, event, helper) {
        cmp.set('v.test2', 'v.test2 | ' + helper._count++);
    },
    updateTest3: function (cmp, event, helper) {
        cmp.set('v.test3', 'v.test3 | ' + helper._count++);
    },
    cbAction: function (cmp, event) {
        console.log('CB - Action!', event);
    },
    cbEvent: function (cmp, event) {
      console.log('CB - Event!', event);  
    }
})