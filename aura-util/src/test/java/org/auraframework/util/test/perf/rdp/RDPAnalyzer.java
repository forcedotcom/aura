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
package org.auraframework.util.test.perf.rdp;

import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.util.test.perf.PerfUtil;
import org.auraframework.util.test.perf.data.PerfMetric;
import org.auraframework.util.test.perf.rdp.RDP.Domain;
import org.auraframework.util.test.perf.rdp.RDP.Network;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Analyzes the raw RDP notifications
 */
public final class RDPAnalyzer {

    protected static final Logger LOG = Logger.getLogger(RDPAnalyzer.class.getSimpleName());

    private final List<RDPNotification> notifications;
    private Map<String, TimelineEventStats> timelineEventsStats;

    public RDPAnalyzer(List<RDPNotification> notifications) {
        this.notifications = notifications;
    }

    /**
     * Collecs statistics on all the "Timeline.eventRecorded" events
     */
    public synchronized Map<String, TimelineEventStats> analyzeTimelineDomain() {
        if (timelineEventsStats != null) {
            return timelineEventsStats;
        }

        timelineEventsStats = Maps.newHashMap();
        for (RDPNotification notification : notifications) {
            try {
                // System.out.println(notification.getJSON().toString(2));
                String method = notification.getMethod();
                if (RDP.Timeline.eventRecorded.equals(method)) {
                    addTimelineEvent(notification.getParams().getJSONObject("record"));
                }
            } catch (Exception e) {
                LOG.log(Level.WARNING, notification.toString(), e);
            }
        }
        return timelineEventsStats;
    }

    /**
     * @param timeline event, see
     *            https://developers.google.com/chrome-developer-tools/docs/protocol/tot/timeline#type-TimelineEvent
     */
    private void addTimelineEvent(JSONObject timelineEvent) throws JSONException {
        // add event itself
        String type = timelineEvent.getString("type");

        // times are of this form "1.3976003351068398E12"
        String startTime = timelineEvent.getString("startTime");
        long elapsedMicros = 0;
        if (timelineEvent.has("endTime")) {
            elapsedMicros = PerfUtil.elapsedMicros(startTime, timelineEvent.getString("endTime"));
        } else {
            // TODO: events without endTime
        }

        TimelineEventStats stats = timelineEventsStats.get(type);
        if (stats == null) {
            stats = new TimelineEventStats(type);
            timelineEventsStats.put(type, stats);
        }
        stats.addEvent(elapsedMicros);

        // collect event details
        JSONObject details = timelineEvent.getJSONObject("data");
        if (details != null && details.length() > 0) {
            stats.addDetails(timelineEvent.getJSONObject("data"));
        }

        // add also the nested records
        if (timelineEvent.has("children")) {
            JSONArray children = timelineEvent.getJSONArray("children");
            for (int i = 0; i < children.length(); i++) {
                addTimelineEvent(children.getJSONObject(i));
            }
        }
    }

    /**
     * Analyzes the Network domain events and returns a set of PerfMetrics derived from them
     */
    public List<PerfMetric> analyzeNetworkDomain() {
        // Sequence and relevant fields:
        // requestWillBeSent: timestamp requestId params.documentURL
        // responseReceived: timestamp params.requestId params.response.timing?
        // dataReceived+: timestamp params.requestId params.dataLength params.encodedDataLength
        // loadingFinished: timestamp params.requestId params.encodedDataLength?

        // collect the following metrics:
        // numRequests: details: documentURL + size
        // totalEncodedDataLength: details: documentURL+size
        Map<String, JSONObject> requestIdToDetail = Maps.newHashMap();
        int numRequests = 0;
        int totalEncodedDataLength = 0;
        JSONArray details = new JSONArray();
        for (RDPNotification timelineEvent : RDPUtil.filterNotifications(notifications, Domain.Network)) {
            try {
                String method = timelineEvent.getMethod();
                JSONObject params = timelineEvent.getParams();
                if (Network.requestWillBeSent.equals(method)) {
                    JSONObject request = params.getJSONObject("request");
                    JSONObject detail = new JSONObject();
                    detail.put("url", request.getString("url"));
                    detail.put("method", request.getString("method"));
                    detail.put("encodedDataLength", 0);
                    requestIdToDetail.put(params.getString("requestId"), detail);
                } else if (Network.dataReceived.equals(method)) {
                    JSONObject detail = requestIdToDetail.get(params.getString("requestId"));
                    int encodedDataLength = params.getInt("encodedDataLength");
                    detail.put("encodedDataLength", detail.getInt("encodedDataLength") + encodedDataLength);
                } else if (Network.loadingFinished.equals(method)) {
                    JSONObject detail = requestIdToDetail.get(params.getString("requestId"));
                    if (detail == null) {
                        // spurious first events?
                        continue;
                    }
                    if (params.has("encodedDataLength")) {
                        // some chromedriver versions don't have encodedDataLength in loadingFinished
                        // if there, check that matches the one in dataReceived
                        int finishedEncodedDataLength = params.getInt("encodedDataLength");
                        int encodedDataLength = detail.getInt("encodedDataLength");
                        if (finishedEncodedDataLength != encodedDataLength) {
                            LOG.log(Level.WARNING, "encodedDataLength doesn't match: " + finishedEncodedDataLength
                                    + " != " + encodedDataLength);
                        }
                    }
                    numRequests++;
                    totalEncodedDataLength += detail.getInt("encodedDataLength");
                    details.put(detail);
                }
            } catch (Exception e) {
                LOG.log(Level.WARNING, timelineEvent.toDetailString(), e);
            }
        }

        PerfMetric numRequestsMetric = new PerfMetric("Network.numRequests", numRequests);
        PerfMetric encodedDataLengthMetric = new PerfMetric("Network.encodedDataLength", totalEncodedDataLength,
                "bytes");
        numRequestsMetric.setDetails(details);
        encodedDataLengthMetric.setDetails(details);

        return Lists.newArrayList(numRequestsMetric, encodedDataLengthMetric);
    }
}
