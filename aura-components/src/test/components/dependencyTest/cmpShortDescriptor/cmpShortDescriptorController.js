({
    init: function(cmp) {
        $A.createComponent("dependencyTest:cmpTarget", {
        }, function(newCmp, status) {
            $A.getEvt("markup://dependencyTest:notify").fire({status: status});
        });
    }
})