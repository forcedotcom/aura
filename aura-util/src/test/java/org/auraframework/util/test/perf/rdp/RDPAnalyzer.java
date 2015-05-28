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
import org.auraframework.util.test.perf.metrics.PerfMetric;
import org.auraframework.util.test.perf.rdp.RDP.Domain;
import org.auraframework.util.test.perf.rdp.RDP.Network;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.gson.Gson;

/**
 * Analyzes the raw RDP notifications
 */
public final class RDPAnalyzer {

    protected static final Logger LOG = Logger.getLogger(RDPAnalyzer.class.getSimpleName());

    private final List<RDPNotification> notifications;
    private final List<RDPNotification> filteredNotifications;
    private final List<JSONObject> filteredFlattenedTimelineEvents;
    private Map<String, TimelineEventStats> timelineEventsStats;
    private final List<JSONObject> filteredFlattenedTraceEvents;
    private Map<String, TraceEventStats> traceEventsMap;
    private List<JSONObject> flattenedTraceEvents;
    

    public RDPAnalyzer(List<RDPNotification> notifications, String startMarker, String endMarker) {
        this.notifications = notifications;
        filteredNotifications = RDPUtil.filteredNotifications(notifications, startMarker, endMarker);

        List<JSONObject> flattenedTimelineEvents = RDPUtil.flattenedTimelineEvents(notifications);
        this.filteredFlattenedTimelineEvents = RDPUtil
                .filteredTimeline(flattenedTimelineEvents, startMarker, endMarker);
        
        flattenedTraceEvents = RDPUtil.flattenedTraceEvents(notifications);
        this.filteredFlattenedTraceEvents = RDPUtil
                .filteredTimeline(flattenedTraceEvents, startMarker, endMarker);
        
        LOG.info("num trace events: " + flattenedTraceEvents.size() 
        		+ ", num filtered: "
                + this.filteredFlattenedTraceEvents.size());
    }

    public List<RDPNotification> getFilteredNotifications() {
        return filteredNotifications;
    }

    public List<JSONObject> getFilteredFlattenedTimelineEvents() {
        return filteredFlattenedTimelineEvents;
    }

    /**
     * Collecs statistics on all the "Timeline.eventRecorded" events
     */
    public synchronized Map<String, TimelineEventStats> analyzeTimelineDomain() {
        if (timelineEventsStats != null) {
            return timelineEventsStats;
        }

        timelineEventsStats = Maps.newHashMap();
        for (JSONObject timelineEvent : filteredFlattenedTimelineEvents) {
            try {
                collectTimelineEvent(timelineEvent);
            } catch (Exception e) {
                LOG.log(Level.WARNING, String.valueOf(timelineEvent), e);
            }
        }
        return timelineEventsStats;
    }
    
    /**
     * Collects statistics on all the "Tracing.dataCollected" events
     */
    public synchronized Map<String, TraceEventStats> analyzeTraceDomain() {
        if (traceEventsMap != null) {
            return traceEventsMap;
        }

        traceEventsMap = Maps.newHashMap();
        for (JSONObject traceEvent : filteredFlattenedTraceEvents) {
            try {
                collectTraceEvent(traceEvent);
            } catch (Exception e) {
                LOG.log(Level.WARNING, String.valueOf(traceEvent), e);
            }
        }
        return traceEventsMap;
    }

    /**
     * @param trace event, see
     *            https://sites.google.com/a/chromium.org/chromedriver/logging/performance-log
     *            eg: {"tts":118019,"cat":"disabled-by-default-devtools.timeline","ts":1.089338730489E12,"args":{},"name":"Program","pid":1447,"tid":1299,"ph":"B"}
     * @throws Exception 
     */
    private void collectTraceEvent(JSONObject traceEvent) throws Exception {
    	Gson gson = new Gson();
    	TraceEvent event = gson.fromJson(traceEvent.toString(), TraceEvent.class);
    	String name = event.getName();

    	TraceEventStats stats = traceEventsMap.get(name);
        if (stats == null) {
            stats = new TraceEventStats(event);
            traceEventsMap.put(name, stats);
        }

        if (event.getType().equals(TraceEvent.Type.Complete)) {
        	stats.updateTotalMicros(event.getDuration());
        } else if (event.getType().equals(TraceEvent.Type.Duration)) {
        	handleDurationEvent(event, stats);
        } else if(event.getType().equals(TraceEvent.Type.Instant)) {
        	handleInstantEvent(event, stats);
        } else {
        	// handle unsupported event type
        	//throw new Exception("Unsupported Event Type : " + event.getType());
        }
    }
    
    private void handleInstantEvent(TraceEvent event, TraceEventStats stats){
    	// Slight difference in handling of memory counters
    	if(event.getName().equals("UpdateCounters")){
    		try {
				stats.updateMemoryCounters(event.getData());
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
    	}    		
    	// TODO handle other type of instant events
    }
    
    private void handleDurationEvent(TraceEvent event, TraceEventStats stats){
    	Long currTimeStamp = event.getTimeStamp();
    	Long prevTimeStamp = stats.getEvent().getTimeStamp();
    	
    	if(event.getPhase().equals("B")){
    		stats.setStartTime(currTimeStamp);
    	} else {       	
        	if(currTimeStamp > prevTimeStamp) {
        		long elapsedMicros = (long) ((new Double(currTimeStamp) - new Double(prevTimeStamp)) * 1000);
        		stats.updateTotalMicros(elapsedMicros);
        		stats.resetTime();
        	}
    	}
    }
    
    /**
     * @param timeline event, see
     *            https://developers.google.com/chrome-developer-tools/docs/protocol/tot/timeline#type-TimelineEvent
     */
    private void collectTimelineEvent(JSONObject timelineEvent) throws JSONException {
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
    }

    /**
     * Analyzes the Network domain events and returns a set of PerfMetrics derived from them
     */
    public List<PerfMetric> analyzeNetworkDomain() {
        // Sequence and relevant fields:
        // requestWillBeSent: timestamp requestId params.documentURL
        // responseReceived: timestamp params.requestId params.response.timing?
        // dataReceived+: timestamp params.requestId params.dataLength params.encodedDataLength
        // loadingFinished/Failed: timestamp params.requestId params.encodedDataLength?

        // collect the following metrics:
        // numRequests: details: documentURL + size
        // totalEncodedDataLength: details: documentURL+size
        Map<String, JSONObject> requestIdToDetail = Maps.newHashMap();
        int numRequests = 0;
        int totalEncodedDataLength = 0;
        JSONArray details = new JSONArray();
        for (RDPNotification notification : RDPUtil.filterNotifications(filteredNotifications, Domain.Network)) {
            try {
                String method = notification.getMethod();
                JSONObject params = notification.getParams();
                if (Network.requestWillBeSent.equals(method)) {
                    JSONObject request = params.getJSONObject("request");
                    JSONObject detail = new JSONObject();
                    detail.put("url", request.getString("url"));
                    detail.put("method", request.getString("method"));
                    detail.put("encodedDataLength", 0);
                    requestIdToDetail.put(params.getString("requestId"), detail);
                    continue;
                }

                String requestId = params.getString("requestId");
                JSONObject detail = requestIdToDetail.get(requestId);
                if (detail == null) {
                    LOG.log(Level.WARNING, "no matching requestWillBeSent found for: " + notification.toJSONString());
                    // spurious first events?
                    continue;
                }

                if (Network.dataReceived.equals(method)) {
                    int encodedDataLength = params.getInt("encodedDataLength");
                    detail.put("encodedDataLength", detail.getInt("encodedDataLength") + encodedDataLength);
                } else if (Network.loadingFinished.equals(method)) {
                    if (params.has("encodedDataLength")) {
                        // some chromedriver versions don't have encodedDataLength in loadingFinished
                        // if there, check that matches the one in dataReceived
                        int finishedEncodedDataLength = params.getInt("encodedDataLength");
                        int encodedDataLength = detail.getInt("encodedDataLength");
                        if (finishedEncodedDataLength != encodedDataLength) {
                            LOG.log(Level.WARNING, "encodedDataLength doesn't match: " + finishedEncodedDataLength
                                    + " (from loadingFinished) != " + encodedDataLength + " (from dataReceived)");
                        }
                    }
                    numRequests++;
                    totalEncodedDataLength += detail.getInt("encodedDataLength");
                    details.put(detail);
                    requestIdToDetail.remove(requestId);
                } else if (Network.loadingFailed.equals(method)) {
                    // count also pages that fail to load
                    detail.put("loadingFailed", "true");
                    String errorText = params.has("errorText") ? params.getString("errorText") : null;
                    if (errorText != null && errorText.trim().length() > 0) {
                        detail.put("errorText", errorText);
                    }
                    numRequests++;
                    details.put(detail);
                    requestIdToDetail.remove(requestId);
                }
            } catch (Exception e) {
                LOG.log(Level.WARNING, notification.toJSONString(), e);
            }
        }

        // count also request that don't have a matching loadingFinished/Failed
        // (the final aura POST fails in this category)
        for (String requestId : requestIdToDetail.keySet()) {
            JSONObject detail = requestIdToDetail.get(requestId);
            LOG.log(Level.INFO, "no matching loadingFinished/Failed found for: " + detail.toString());
            numRequests++;
            details.put(detail);
        }

        PerfMetric numRequestsMetric = new PerfMetric("Network.numRequests", numRequests);
        PerfMetric encodedDataLengthMetric = new PerfMetric("Network.encodedDataLength", totalEncodedDataLength,
                "bytes");
        numRequestsMetric.setDetails(details);
        encodedDataLengthMetric.setDetails(details);

        return Lists.newArrayList(numRequestsMetric, encodedDataLengthMetric);
    }

    // dev tools log

    public List<JSONObject> getDevToolsLog() {
        List<JSONObject> devToolsLog = Lists.newArrayList();
        for (RDPNotification notification : notifications) {
            if (notification.isTraceEvent()) {
            	devToolsLog.add(notification.getTraceEvent());
            }
        }
        return devToolsLog;
    }

    /**
     * @return the log between our timeline marks only
     */
    public List<JSONObject> getFilteredDevToolsLog() {
        List<JSONObject> devToolsLog = Lists.newArrayList();
        for (RDPNotification notification : filteredNotifications) {
            if (notification.isTraceEvent()) {
                devToolsLog.add(notification.getTraceEvent());
            }
        }
        return devToolsLog;
    }
}
