({
    filterLogs: function (logs) {
        return logs.filter(function (line) {
            return line.indexOf('CAPTURE') === 0 || line.indexOf('BUBBLE') === 0;
        });
    },
    parseLog: function (logline) {
        // A log is of the form: `[PHASE] handle [name] in [SOURCE]`
        // We just care about the PHASE and the SOURCE
        var parts = logline.split(' ');
        return parts[0] + parts.pop();
    },
    assertsLogs: function (rawExpectedLogs, rawActualLogs) {
        var expectedLogs = rawExpectedLogs.map(this.parseLog);
        var actualLogs = rawActualLogs.map(this.parseLog);
        $A.test.assertEquals(expectedLogs.join(), actualLogs.join(), "Incorrect phased sequence");
    },
    assertExpectedEvents: function (logs, expectedEvents) {
        $A.test.assertEquals(logs.length, expectedEvents, 'Expected ' + expectedEvents + ' events to be registered');
    },
    testInteropAppEventsSyncBetweenLWCandAura: {
        test : function(cmp) {
            setTimeout($A.getCallback(function () {
                var logger = cmp.find('logPanel');
                var sources = cmp.sources; // cmp.sources on this root is populated via: testAppEventPhasesEmitterController init method
                var expectedEvents = 6;

                // Trigger the event on Aura to Aura components and get the logs
                var auraToAuraTrigger = sources["aura"];
                auraToAuraTrigger.get('c.fireEvent').run();
                var auraEventLogs = this.filterLogs(logger.get('v.logs'));
                this.assertExpectedEvents(auraEventLogs, expectedEvents);
                logger.clear();

                // Trigger the event in the interop (sync)
                var auraToAuraTrigger = sources["interop-sync"];
                auraToAuraTrigger.get('c.fireEvent').run();
                var interopEventLogs = this.filterLogs(logger.get('v.logs'));
                this.assertExpectedEvents(interopEventLogs, expectedEvents);
                logger.clear();

                this.assertsLogs(auraEventLogs, interopEventLogs);
            }.bind(this)), 10);
        }
    },
    testInteropAppEventsAsyncBetweenLWCandAura: {
        test : function(cmp) {
            setTimeout($A.getCallback(function () {
                var logger = cmp.find('logPanel');
                var sources = cmp.sources; // cmp.sources on this root is populated via: testAppEventPhasesEmitterController init method
                var expectedEvents = 6;

                // Trigger the event on Aura to Aura components and get the logs
                var auraToAuraTrigger = sources["aura"];
                auraToAuraTrigger.get('c.fireEvent').run();
                var auraEventLogs = this.filterLogs(logger.get('v.logs'));
                this.assertExpectedEvents(auraEventLogs, expectedEvents);
                logger.clear();

                // Trigger the event in the interop (async)
                var auraToAuraTrigger = sources["interop-async"];
                auraToAuraTrigger.get('c.fireEvent').run();
                var interopAsyncEventLogs = this.filterLogs(logger.get('v.logs'));
                this.assertExpectedEvents(interopAsyncEventLogs, expectedEvents);
                logger.clear();

                this.assertsLogs(auraEventLogs, interopAsyncEventLogs);
            }.bind(this)), 10);
        }
    }
})