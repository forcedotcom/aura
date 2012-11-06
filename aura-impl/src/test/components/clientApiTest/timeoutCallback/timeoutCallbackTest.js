/*
 * Copyright (C) 2012 salesforce.com, inc.
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

    /**
     * Just sanity check a simple usage.
     */
    testBasicWait : {
        test : function(cmp) {
            var invoked = false;
            var start = new Date();
            var cb = function() {
                invoked = true;
                $A.test.assertTrue(new Date() - start > 60);
            };
            var timeoutCallback = $A.util.createTimeoutCallback(cb, 60);
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
            var finished = false;
            var count = 0;
            var start = new Date();
            var cb = function() {
                count += 1;
            };

            var timeoutCallback = $A.util.createTimeoutCallback(cb, 60);
            // Invoke several tijmes
            timeoutCallback();
            timeoutCallback();
            // Invoke async too.
            setTimeout(timeoutCallback, 10);
            setTimeout(timeoutCallback, 30);

            // Finish the test some time after we might expect an erroneous
            // second invocation.
            setTimeout(function() {
                $A.test.assertEquals(1, count,
                        "callback should have only been invoked once");
                finished = true;
            }, 500);

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
            var invoked = false;
            var start = new Date();
            var halfway = null;
            var cb = function() {
                invoked = true;
                var now = new Date();
                $A.test.assertTrue(halfway != null);
                var secondPeriod = now - halfway;
                $A.test.assertTrue(secondPeriod > 60,
                        "timeout should have waited at least 60ms");
                // window.setTimeout guarantees it will wait at least as long as
                // we ask. Historically, javascript timers have had ~15ms
                // resolution. So, allow the secondPeriod to be a bit more than
                // the original time but assume anything more than 15ms overage
                // is a scheduling bug.
                $A.test.assertTrue(secondPeriod < 75,
                        "timeout window was unnecessarily expanded");
            };
            var timeoutCallback = $A.util.createTimeoutCallback(cb, 60);
            timeoutCallback();

            setTimeout(function() {
                // now invoke halfway through the period.
                halfway = new Date();
                timeoutCallback();
            }, 30);

            $A.test.addWaitFor(true, function() {
                return invoked;
            });
        }
    }

})
