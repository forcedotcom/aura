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
    refresh: function (cmp, event, helper) {
        helper.crosstab.broadcast('refresh');
        window.location.reload();
    },
    init: function (cmp, event, helper) {
        var Mutex = $A.util.Mutex;
        var tabId = Mutex.getClientId();
        var isMaster = location.href.indexOf('master') !== -1;
        var tabs = parseInt(location.href.match(/[?&]tabs=([^&#]*)|&|#|$/)[1]) || 1;

        cmp.set('v.isMaster', isMaster);
        cmp.set('v.tabId', tabId);

        if (isMaster) {
            localStorage.clear();
            localStorage.setItem('test', '\n');
        }

        console.log('TABID: %s \n', tabId);

        function fib (n) { if (n <= 2) { return 1; } return fib(n - 2) + fib(n - 1);}
        var crosstab = helper.crosstab = helper.lib.crosstab.getInstance();

        function claimLocker() {
            console.log('About to claim locker at: ' + Date.now() + '<br>');

            Mutex.lock(function (unlock) {
                // Execute fibonacci of N to have variability on the execution time
                var n = Math.floor(Math.random() * 40);
                var t = 'fib(' + n + ')';
                console.time(t);
                fib(n);
                console.timeEnd(t);

                // Read, append, write
                var currentState = localStorage.getItem('test') || '';

                var newState = '> TabId: ' + tabId + ' \t| Wrote on: </br>' + new Date(Date.now()) + ' \n </br>';

                // Append
                var concat = currentState + newState;

                // Write
                localStorage.setItem('test', concat);

                unlock();
            });

            if (isMaster) {
                var retries = 10;
                function wait() {
                    var items = localStorage.getItem('test').split('|').length - 1;
                    console.log('Items written in storage: %s of %s ', localStorage.getItem('test').split('|').length - 1, tabs);

                    if (items >= tabs) {
                        setTimeout(function () {
                            console.log('All writes were successfull and with no race conditions!');
                        }, 2000);
                    } else {
                        if (!(--retries)) {
                            console.log('We failed!');
                        } else {
                            setTimeout(function () {
                                wait();
                            }, 1000);
                        }
                    }
                }

                setTimeout(function () { wait(); }, 1000);
            }
        }

        // Claim in the next 10 seconds (trying to sync between tabs here)
        var modulus = 10;
        var more = (Math.round(Date.now() / 1000) % modulus);
        var remaining = modulus - more;

        setTimeout(function () {
            claimLocker();
        }, remaining * 1000);

        console.log('Timeout in: %s', modulus - more);

        crosstab.on('refresh', function () {
            location.reload();
        });
    }
})