/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    timeSlice : 120,

    /**
     * Just sanity check a simple usage.
     */
    testBasicWait : {
        test : function(cmp) {
            var self = this;
            var invoked = false;
            var start = new Date();
            var cb = function() {
                invoked = true;
                var delta = new Date() - start;
                $A.test.assertTrue(delta >= self.timeSlice);
            };
            var timeoutCallback = $A.util.createTimeoutCallback(cb, self.timeSlice);
            timeoutCallback();

            $A.test.addWaitFor(true, function() {
                return invoked;
            });
        }
    },

    /**
     * Make sure that repeated invocations of the timeout callback within the
     * period only cause one invocation of the user function.
     */
    testRepeatedInvoke : {
        test : function(cmp) {
            var self = this;
            var finished = false;
            var count = 0;
            var start = new Date();
            var cb = function() {
                count += 1;
            };

            var timeoutCallback = $A.util.createTimeoutCallback(cb, self.timeSlice);
            // Invoke several tijmes
            timeoutCallback();
            timeoutCallback();
            // Invoke async too.
            setTimeout(timeoutCallback, self.timeSlice/4);
            setTimeout(timeoutCallback, self.timeSlice/2);

            // Finish the test some time after we might expect an erroneous
            // second invocation.
            setTimeout(function() {
                $A.test.assertEquals(1, count,
                        "callback should have only been invoked once");
                finished = true;
            }, self.timeSlice * 4);

            $A.test.addWaitFor(true, function() {
                return finished;
            });
        }
    },

    /**
     * Make sure that an invocation in the middle of the period does not extend
     * the scheduler too much. An invocation halfway through the period should
     * only delay the invocation from the start time by approximately 1/2 of the
     * period.
     */
    testPeriodReset : {
        test : function(cmp) {
            var self = this;
            var invoked = false;
            var start = new Date();
            var halfway = null;
            var cb = function() {
                invoked = true;
                var now = new Date();
                $A.test.assertTrue(halfway != null);
                var secondPeriod = now - halfway;
                $A.test.assertTrue(secondPeriod >= self.timeSlice,
                        "timeout should have waited at least " + self.timeSlice);
                // window.setTimeout guarantees it will wait at least as long as
                // we ask. Historically, javascript timers have had ~15ms
                // resolution. So, allow the secondPeriod to be a bit more than
                // the original time but assume anything more than 15ms overage
                // is a scheduling bug.
                $A.test.assertTrue(secondPeriod < self.timeSlice * 1.5,
                        "timeout window was unnecessarily expanded");
            };
            var timeoutCallback = $A.util.createTimeoutCallback(cb, self.timeSlice);
            timeoutCallback();

            setTimeout(function() {
                // now invoke halfway through the period.
                halfway = new Date();
                timeoutCallback();
            }, self.timeSlice / 2);

            $A.test.addWaitFor(true, function() {
                return invoked;
            });
        }
    }

})
