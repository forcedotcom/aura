({
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
    }
})