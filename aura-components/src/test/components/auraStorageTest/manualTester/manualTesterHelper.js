({
    // save references to windows this runner spawns
    WINDOWS: [],

    // collection of logs for each window running the tool
    WINDOWS_LOGS: [],

    start: function(cmp) {
        var that = this;
        var windowCount = parseInt(cmp.get("v.windowCount"));
        $A.assert(windowCount > 0 && windowCount <= 10, "Select number of windows between 1 and 10 (inclusive)");
        this.reset(cmp);
        this.openWindows(cmp, windowCount);
        this.waitForWindowsLoaded(cmp, function() {
            that.startJobs(cmp);
        });
    },

    openWindows: function(cmp, windowCount) {
        this.log(cmp, "Opening " + windowCount + " windows and waiitng for Aura to initialize");
        var randomActions = cmp.get("v.randomActions");
        var randomTiming = cmp.get("v.randomTiming");
        for (var i = 0; i < windowCount; i++) {
            this.WINDOWS.push(window.open("/auraStorageTest/manualTesterCmp.cmp?randomActions="+randomActions+"&randomTiming="+randomTiming));
        }
    },

    reset: function(cmp) {
        this.WINDOWS = [];
        this.WINDOWS_LOGS = [];
        cmp.set("v.stopper", false);
     },

    /**
     * Loop through all window instances and verify Aura has finished initializing.
     */
    waitForWindowsLoaded: function(cmp, callback) {
        var that = this;
        var windowsLoaded = false;
        var timer = setTimeout(function() {
            if (!windowsLoaded) {
                throw new Error("Windows did not fully load after 20 seconds, please retry");
            }
        }, 20000);

        function checkWindowsLoaded() {
            for (var i = 0; i < that.WINDOWS.length; i++) {
                var currWindow = that.WINDOWS[i];
                if (!currWindow) {
                    throw new Error("All expected windows not present, try disabling your pop-up blocker");
                }
                if (!currWindow.$A || !currWindow.$A.finishedInit) {
                    setTimeout(function() { checkWindowsLoaded(); }, 100);
                    return;
                }
            }
            windowsLoaded = true;
            clearTimeout(timer);
            callback();
        }

        checkWindowsLoaded();
    },

    /**
     * Start the testing tool job on each window.
     */
    startJobs: function(cmp) {
        var that = this;
        this.log(cmp, "Starting storage tester on all opened windows");
        for (var i = 0; i < that.WINDOWS.length; i++) {
            that.WINDOWS[i].$A.getRoot().start();
        }
        that.waitForJobCompletion(cmp);
    },

    /**
     * Wait loop for one of the tabs to error out.
     */
    waitForJobCompletion: function(cmp) {
        var that = this;

        function checkJobsComplete() {
            // check if user has clicked stop button
            if (cmp.get("v.stopper")) {
                that.stopJobs(cmp);
                return;
            }

            for (var i = 0; i < that.WINDOWS.length; i++) {
                if (that.WINDOWS[i].$A.getRoot().helper.FAIL_MESSAGE) {
                    that.stopJobs(cmp);
                    var errorMsg = that.WINDOWS[i].$A.getRoot().helper.FAIL_MESSAGE;
                    that.log(cmp, "Window at index " + i + " errored out with message: " + errorMsg);
                    that.collectAndProcessLogs(cmp, i, errorMsg);
                    return;
                }
            }

            that.log(cmp, "Waiting for a window to error");
            setTimeout($A.getCallback(checkJobsComplete), 100);
        }

        checkJobsComplete();
    },

    collectAndProcessLogs: function(cmp, failedWindowIndex, errorMsg) {
        for (var i = 0; i < this.WINDOWS.length; i++) {
            var currWindow = this.WINDOWS[i];
            this.WINDOWS_LOGS[i] = currWindow.$A.getRoot().helper.ACTIONS_LOG;
            this.log(cmp, "Window " + i + " logs:");
            this.prettyPrintLogs(cmp, this.WINDOWS_LOGS[i]);
        }
    },

    prettyPrintLogs: function(cmp, logs) {
        for (var i = 0; i < logs.length; i++) {
            var time = new Date(logs[i]["time"]);
            var timeFormatted = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + ":" + time.getMilliseconds();
            this.log(cmp, "Time: " + timeFormatted + " | event: " + logs[i]["event"]);
        }
    },

    stopJobs: function(cmp) {
        this.log(cmp, "Stopping all jobs");
        for (var i = 0; i < this.WINDOWS.length; i++) {
            this.WINDOWS[i].$A.getRoot().stop();
        }
    },

    closeTabs: function(cmp) {
        for (var i = 0; i < this.WINDOWS.length; i++) {
            this.WINDOWS[i].close();
        }
    },

    log: function(cmp, msg) {
        var waitingText = "Waiting for a window to error";
        var regex = new RegExp(waitingText+"(\\.)*$");
        var output = cmp.find("output").get("v.value");
        if (regex.test(output) && msg === waitingText) {
            output += ".";
        } else {
            output += "\n" + msg;
        }
        cmp.find("output").set("v.value", output);
    }
})