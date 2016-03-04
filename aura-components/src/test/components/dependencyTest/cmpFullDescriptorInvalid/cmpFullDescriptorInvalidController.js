({
    init: function(cmp) {
        $A.createComponent("markup://dependencyTest:cmpTargetInvalid", {
        }, function(newCmp, status) {
            $A.getEvt("markup://dependencyTest:notify").fire({status: status});
        });
    }
})