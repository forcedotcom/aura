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

import org.auraframework.test.perf.rdp.TimelineEventUtil.Category;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Collects stats for all TimelineEvents in a recording
 */
public final class TimelineEventStats {

    private final String type;
    private final Category category;
    private int count;
    private int totalMicros;
    private JSONArray details;

    public TimelineEventStats(String type) {
        this.type = type;
        category = TimelineEventUtil.toCategory(type);
    }

    public String getType() {
        return type;
    }

    public Category getCategory() {
        return category;
    }

    /**
     * @return number of times the event type appears in the timeline
     */
    public int getCount() {
        return count;
    }

    /**
     * @return cumulative milliseconds for this type of event in the timeline
     */
    public int getTotalMillis() {
        return totalMicros / 1000; // TODO: round
    }

    /**
     * @return details for each appearance of this event type in the timeline
     */
    public JSONArray getDetails() {
        return details;
    }

    public void addEvent(long elapsedMicros) {
        count++;
        totalMicros += elapsedMicros;
    }

    public void addDetails(JSONObject detail) {
        if (details == null) {
            details = new JSONArray();
        }
        details.put(detail);
    }

    @Override
    public String toString() {
        return type + '[' + count + ',' + getTotalMillis() + "ms]";
    }
}
