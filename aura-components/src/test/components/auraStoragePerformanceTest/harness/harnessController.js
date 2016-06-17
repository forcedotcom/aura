({
    init: function (cmp, event, helper) {

        $A.PerfRunner.run(function (done) {
            // inform PerfRunner that the test is async
            var completedFn =  done.async();

            cmp.find("operations").run(completedFn);
        });
    },

    locationChange: function (cmp, event, helper) {
        $A.PerfRunner.clearRun();
    },
})
