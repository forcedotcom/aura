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
import java.util.logging.Logger;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class TraceEventUtil {

	protected static final Logger LOG = Logger.getLogger(TraceEventUtil.class.getSimpleName());

	// Event Category
	// Refer https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/devtools/front_end/timeline/TimelineUIUtils.js&type=cs&sq=package:chromium
    public enum Category {
        Loading, Scripting, Rendering, Painting, Memory, Other;
    }

    // Event Type
    // Refer: https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit#heading=h.f2f0yd51wi15
    public enum Type {
        Duration, Complete, Instant;
    }
    
    // Event name to type mapping
    private static final Map<String, Category> nameToCategory = Maps.newHashMap();

    static {
    	// Loading
    	nameToCategory.put("ParseHTML", Category.Loading);
    	
    	// Painting
    	nameToCategory.put("Paint", Category.Painting);
    	nameToCategory.put("CompositeLayers", Category.Painting);

        // Rendering
    	nameToCategory.put("Layout", Category.Rendering);
    	nameToCategory.put("ScheduleStyleRecalculation", Category.Rendering);
    	nameToCategory.put("RecalculateStyles", Category.Rendering);
    	nameToCategory.put("InvalidateLayout", Category.Rendering);
    	nameToCategory.put("UpdateLayerTree", Category.Rendering);
        
        // Memory
    	//nameToCategory.put("UpdateCounters", Category.Memory);
    	nameToCategory.put("jsHeapSizeUsed", Category.Memory);
    	nameToCategory.put("documents", Category.Memory);
    	nameToCategory.put("nodes", Category.Memory);
    	nameToCategory.put("jsEventListeners", Category.Memory);
    }
    
    /**
     * @param name trace event name
     * @return trace event category
     */
    public static Category toCategory(String name) {
        if (!nameToCategory.containsKey(name)) {
            LOG.info("unknown category for: " + name);
            return Category.Other;
        }
        return nameToCategory.get(name);
    }

    /**
     * 
     * @return the full metric name, i.e. Tracing.EventType.EventName
     * eg: "Tracing.Painting.Paint"
     */
    public static String toMetricName(String name) {
        return "Tracing." + toCategory(name) + '.' + name;
    }
    

    /**
     * @return all the trace event names for the type
     */
    public static List<String> getEventNames(Category category) {
        List<String> names = Lists.newArrayList();
        for (String name : nameToCategory.keySet()) {
            if (toCategory(name) == category) {
            	names.add(name);
            }
        }
        return names;
    }

    /**
     * @return all the metric names for the event type
     */
    public static List<String> getMetricNames(Category category) {
        List<String> metricNames = Lists.newArrayList();
        for (String eventName : nameToCategory.keySet()) {
            if (toCategory(eventName) == category) {
            	metricNames.add(toMetricName(eventName));
            }
        }
        return metricNames;
    }
    
    /**
     * @return null if it is not a time stamp, else the message in the time stamp
     */
    public static String isTimelineTimeStamp(JSONObject traceEvent) {
        try {
            if (!"TimeStamp".equals(traceEvent.getString("name"))) {
                return null;
            }
            return traceEvent.getJSONObject("args").getJSONObject("data").getString("message");
            
        } catch (JSONException e) {
            throw new RuntimeException(traceEvent.toString(), e);
        }
    }
    
    /**
     * @return true if the timelineEvent is a time stamp with the given message
     */
    public static boolean isTimelineTimeStamp(JSONObject traceEvent, String message) {
        if (message == null) {
            return false;
        }
        return message.equals(isTimelineTimeStamp(traceEvent));
    }
    
    /**
     * @return true if the timelineEvent or one of its descendants is a time stamp with the given message
     */
    public static boolean containsTimelineTimeStamp(JSONObject traceEvent, String message) {
        if (isTimelineTimeStamp(traceEvent, message)) {
            return true;
        }
        return false;
    }

}
