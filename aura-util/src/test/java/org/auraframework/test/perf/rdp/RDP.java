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
package org.auraframework.test.perf.rdp;

/**
 * Remote Debug Protocol constants<br/>
 * https://developers.google.com/chrome-developer-tools/docs/protocol/tot/<br>
 * https://developer.apple.com/safari/tools/
 */
public interface RDP {

    enum Domain {
        Network, Timeline, Page;
    }

    interface Network {
        String dataReceived = "Network.dataReceived";
        String loadingFailed = "Network.loadingFailed";
        String loadingFinished = "Network.loadingFinished";
        String requestServedFromCache = "Network.requestServedFromCache";
        String requestWillBeSent = "Network.requestWillBeSent";
        String responseReceived = "Network.responseReceived";
    }

    interface Timeline {
        String eventRecorded = "Timeline.eventRecorded";
    }

    interface Page {
        String domContentEventFired = "Page.domContentEventFired";
        String loadEventFired = "Page.loadEventFired";
    }
}
