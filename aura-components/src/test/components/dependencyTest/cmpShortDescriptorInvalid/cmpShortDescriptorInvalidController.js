({
    init: function(cmp) {
        $A.createComponent("dependencyTest:cmpTargetInvalid", {
        }, function(newCmp, status) {
            $A.getEvt("markup://dependencyTest:notify").fire({status: status});
        });
    }
})