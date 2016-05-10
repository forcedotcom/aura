({
    // keeps a log of the recent events to assist in debugging
    ACTIONS_LOG: [],

    // set this to a non-empty string to signal the test is over
    FAIL_MESSAGE: "",

    START_TIME: 0,

    start: function(cmp) {
        this.START_TIME = new Date().getTime();
        this.loadIFrameAndStart(cmp);
    },

    loadIFrameAndStart: function(cmp) {
        var that = this;
        var iframeSrc = "/auraStorageTest/componentDefStorage.app";
        cmp.helper.lib.iframeTest.loadIframe(cmp, iframeSrc, "iframeContainer", "first load")
            .then(function() {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            })
            .then(function() {
                that.spinCycle(cmp);
            })
            ["catch"](function(e) {
                that.FAIL_MESSAGE("Error during iframe load and initial event: " + e);
            });
    },

    /**
     * Entry point for execution loop to check validity of defs and run the next event.
     */
    spinCycle: function(cmp) {
        var that = this;
        var iframe = cmp.helper.lib.iframeTest.getIframe();
        cmp.helper.eventLib.manualTestValidation.inMemoryValidationFull(iframe, function(failMsg) {
            that.failValidityCheck(cmp, failMsg);
        });
        if (cmp.get("v.stopper") === true) {
            return;
        }
        this.executeEvent(cmp); 
    },

    /**
     * Get the next event to execute based on current setting and run it. At the end of the event execution
     * spinCycle() should be called to continue the loop.
     */
    executeEvent: function(cmp) {
        var event;
        var randomDelay = cmp.get("v.randomTiming");

        if (cmp.get("v.randomActions")) {
            event = cmp.helper.eventLib.manualTestEvents.getRandomEvent(randomDelay);
        } else {
            event = cmp.helper.eventLib.manualTestEvents.getNextPresetEvent(randomDelay);
        }

        this.log(event);

        if (event["action"] === "fetch") {
            this.fetchDef(cmp, event["def"], event["delay"]);
        } else if (event["action"] === "reload") {
            this.reload(cmp);
        } else if (event["action"] === "clearCache") {
            this.clearCache(cmp, event["delay"]);
        }
    },

    log: function(event) {
        // Only keep the last 50 actions
        if (this.ACTIONS_LOG.length > 49) {
            this.ACTIONS_LOG.splice(0, 1);
        }
        var eventLog = event["action"];
        eventLog = eventLog === "fetch" ? eventLog + "[" + event["def"] + "]" : eventLog;
        this.ACTIONS_LOG.push({"event": eventLog, "time": new Date().getTime()});
    },

    fetchDef: function(cmp, def, delay) {
        var that = this;
        setTimeout($A.getCallback(function() {
            cmp.helper.lib.iframeTest.fetchCmp(def);
            cmp.helper.lib.iframeTest.waitForStatus("Fetching: " + def)
                .then(function() {
                    that.spinCycle(cmp);
                });
        }), delay);
    },

    reload: function(cmp) {
        var that = this;
        cmp.helper.lib.iframeTest.reloadIframe(cmp, true, "Error reloading page")
            .then(function() {
                that.spinCycle(cmp);
            });
    },

    clearCache: function(cmp, delay) {
        var that = this;
        setTimeout($A.getCallback(function() {
            var iframe = cmp.helper.lib.iframeTest.getIframe();
            // go through framework clear for real-world scenario of cache clearning mechanism
            iframe.$A.componentService.$clearDefsFromStorage$()
                .then(function() {
                    that.spinCycle(cmp);
                });
        }), delay);
    },

    /**
     * Stop execution and log/display error to user if we're in a bad state.
     */
    failValidityCheck: function(cmp, msg, e) {
        var endTime = new Date().getTime();
        var runTime = endTime - this.START_TIME;
        this.FAIL_MESSAGE = msg;

        // dump a bunch of stuff to console for now to help debugging
        console.log(msg);
        console.log(e);
        console.log(this.ACTIONS_LOG);
        console.log("Failure occurred after " + runTime/1000 + " seconds");

        // Set the flag to stop so the next command won't execute, but let the current one finish to collect
        // any more errors.
        this.log({"action": "stop - failed validity check"});
        cmp.set("v.stopper", true);
    }
})