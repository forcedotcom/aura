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
/*jslint sub: true */

/**
 * @description Counter for in flight actions
 * @constructor
 */
function FlightCounter(max) {
    this.lastStart = 0;
    this.started = 0;
    this.startCount = 0;
    this.inFlight = 0;
    this.sent = 0;
    this.finished = 0;
    this.max = max;
}

FlightCounter.prototype.idle = function() {
    return this.started === 0 && this.inFlight === 0;
};

FlightCounter.prototype.start = function() {
    if (this.started + this.inFlight < this.max) {
        this.started += 1;
        this.startCount += 1;
        // this.lastStart = now;
        return true;
    }
    return false;
};

FlightCounter.prototype.cancel = function() {
    $A.assert(this.started > 0, "broken inFlight counter");
    this.started -= 1;
};

FlightCounter.prototype.send = function() {
    $A.assert(this.started > 0, "broken inFlight counter");
    this.started -= 1;
    this.sent += 1;
    this.inFlight += 1;
};

FlightCounter.prototype.finish = function() {
    $A.assert(this.inFlight > 0, "broken inFlight counter");
    this.inFlight -= 1;
    this.finished += 1;
};

Aura.Controller.FlightCounter = FlightCounter;