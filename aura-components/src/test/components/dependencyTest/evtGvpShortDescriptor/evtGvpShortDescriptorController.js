
({
    init: function() {
        var event = $A.get("e.dependencyTest:evtTarget");
        var status = event ? "SUCCESS" : "ERROR";
        $A.getEvt("markup://dependencyTest:notify").fire({status: status});
    }
})
