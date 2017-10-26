({
    createBody: function(cmp, text) {
        // note that [markup://] moduleTest:simpleCmp would result in Aura Component gets used instead of module even when module is enabled.
        $A.createComponent('moduleTest:simpleCmp', {literal: text}, function(ret, status, statusMessage) {
            if (status === 'SUCCESS') {
                cmp.set('v.body', ret);
            }
        });
    }
})