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

import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Lists;

public final class RDPUtil {

    /**
     * @return true if the notifications list contains a notification with method (i.e. Timeline.eventRecorded)
     */
    public static boolean containsMethod(List<RDPNotification> notifications, String method) {
        for (RDPNotification notification : notifications) {
            if (notification.getMethod().equals(method)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return the notifications for a given domain (i.e. Network/Timeline/...)
     */
    public static List<RDPNotification> filterNotifications(List<RDPNotification> notifications, RDP.Domain domain) {
        List<RDPNotification> domainNotifications = Lists.newArrayList();
        for (RDPNotification notification : notifications) {
            if (domain.equals(notification.getDomain())) {
                domainNotifications.add(notification);
            }
        }
        return domainNotifications;
    }

    /**
     * @return flattened list of all timeline events (i.e. including children events)
     */
    public static List<JSONObject> flattenedTimelineEvents(List<RDPNotification> notifications) {
        List<JSONObject> events = Lists.newArrayList();
        for (RDPNotification notification : notifications) {
            if (notification.isTimelineEvent()) {
                try {
                    addTimelineEvent(events, notification.getTimelineEvent());
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            }
        }
        return events;
    }

    private static void addTimelineEvent(List<JSONObject> events, JSONObject timelineEvent) throws JSONException {
        events.add(timelineEvent);

        // add also the nested records
        if (timelineEvent.has("children")) {
            JSONArray children = timelineEvent.getJSONArray("children");
            for (int i = 0; i < children.length(); i++) {
                addTimelineEvent(events, children.getJSONObject(i));
            }
        }
    }

    /**
     * @return notifications between MARK_TIMELINE_START and MARK_TIMELINE_END (if they exist, otherwise return all
     *         notifications)
     */
    public static List<RDPNotification> filteredNotifications(List<RDPNotification> notifications,
            String startStamp, String endStamp) {
        List<RDPNotification> filtered = Lists.newArrayList();
        boolean skip = notificationsContainTimelineStamp(notifications, startStamp);
        for (RDPNotification notification : notifications) {
            if (skip && notification.isTimelineEvent()
                    && TimelineEventUtil.containsTimelineTimeStamp(notification.getTimelineEvent(), startStamp)) {
                skip = false;
            }
            if (!skip) {
                filtered.add(notification);
                if (notification.isTimelineEvent()
                        && TimelineEventUtil.containsTimelineTimeStamp(notification.getTimelineEvent(), endStamp)) {
                    break;
                }
            }
        }
        return filtered;
    }

    /**
     * @return timeline events between MARK_TIMELINE_START and MARK_TIMELINE_END (if they exist, otherwise return the
     *         whole timeline)
     */
    public static List<JSONObject> filteredTimeline(List<JSONObject> timelineEvents,
            String startStamp, String endStamp) {
        List<JSONObject> filtered = Lists.newArrayList();
        boolean skip = containsTimelineStamp(timelineEvents, startStamp);
        for (JSONObject event : timelineEvents) {
            if (skip && TimelineEventUtil.isTimelineTimeStamp(event, startStamp)) {
                skip = false;
            }
            if (!skip) {
                filtered.add(event);
                if (TimelineEventUtil.isTimelineTimeStamp(event, endStamp)) {
                    break;
                }
            }
        }
        return filtered;
    }

    private static boolean containsTimelineStamp(List<JSONObject> timelineEvents, String timeStamp) {
        if (timeStamp == null) {
            return false;
        }
        for (JSONObject event : timelineEvents) {
            if (TimelineEventUtil.containsTimelineTimeStamp(event, timeStamp)) {
                return true;
            }
        }
        return false;
    }

    private static boolean notificationsContainTimelineStamp(List<RDPNotification> notifications, String timeStamp) {
        if (timeStamp == null) {
            return false;
        }
        for (RDPNotification notification : notifications) {
            if (notification.isTimelineEvent()
                    && TimelineEventUtil.containsTimelineTimeStamp(notification.getTimelineEvent(), timeStamp)) {
                return true;
            }
        }
        return false;
    }
}
