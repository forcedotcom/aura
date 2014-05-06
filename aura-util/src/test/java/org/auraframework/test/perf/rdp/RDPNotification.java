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

import org.auraframework.test.perf.rdp.RDP.Domain;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Represents a Remote Debug Protocol (RDP), raw intrumentation notification
 * https://developers.google.com/chrome-developer-tools/docs/protocol/tot/index
 */
public final class RDPNotification {

    private final JSONObject json; // serialized notification JSON object
    private final String method; // i.e. Timeline.eventRecorded
    private final RDP.Domain domain; // i.e. Page/Runtime/Timeline
    private final String webview;

    public RDPNotification(JSONObject json, String webview) throws JSONException {
        this.json = json;
        this.webview = webview;
        method = json.getString("method");
        domain = RDP.Domain.valueOf(method.substring(0, method.indexOf('.')));
    }

    /**
     * @return the protocol domain, i.e. Page/Timeline/Network/...
     */
    public Domain getDomain() {
        return domain;
    }

    /**
     * @return domain + command, i.e. "Timeline.eventRecorded"
     */
    public String getMethod() {
        return method;
    }

    /**
     * @return the JSON-serialized notification object
     */
    public JSONObject getJSON() {
        return json;
    }

    /**
     * @return the WebView this event belongs to
     */
    public String getWebview() {
        return webview;
    }

    public JSONObject getParams() throws JSONException {
        return json.getJSONObject("params");
    }

    @Override
    public String toString() {
        return "RDPNotification[" + method + ']';
    }

    public String toJSONString() {
        return json.toString();
    }

    // Timeline:

    public JSONObject getTimelineEvent() {
        try {
            return getParams().getJSONObject("record");
        } catch (JSONException e) {
            throw new RuntimeException(toJSONString(), e);
        }
    }

    public boolean isTimelineEvent() {
        return RDP.Timeline.eventRecorded.equals(getMethod());
    }
}
