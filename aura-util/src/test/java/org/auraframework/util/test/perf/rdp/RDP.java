package org.auraframework.util.test.perf.rdp;

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
        // Notifications:
        String dataReceived = "Network.dataReceived";
        String loadingFailed = "Network.loadingFailed";
        String loadingFinished = "Network.loadingFinished";
        String requestServedFromCache = "Network.requestServedFromCache";
        String requestWillBeSent = "Network.requestWillBeSent";
        String responseReceived = "Network.responseReceived";
    }

    interface Timeline {
        // Notifications:
        String eventRecorded = "Timeline.eventRecorded";
    }

    interface Page {
        // Notifications:
        String domContentEventFired = "Page.domContentEventFired";
        String loadEventFired = "Page.loadEventFired";
    }
}
