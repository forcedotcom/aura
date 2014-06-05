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
import java.util.Map;
import java.util.logging.Logger;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Constants and utility methods for RDP TimelineEvents.
 * 
 * @See https://developers.google.com/chrome-developer-tools/docs/protocol/tot/timeline#type-TimelineEvent
 */
public class TimelineEventUtil {

    protected static final Logger LOG = Logger.getLogger(TimelineEventUtil.class.getSimpleName());

    public enum Category {
        Loading, Scripting, Rendering, Painting, Idle, Other;
    }

    private static final Map<String, Category> typeToCategory = Maps.newHashMap();

    static {
        // from
        // https://code.google.com/p/sandrop/source/browse/projects/SandroProxyWeb/chrome_devtools_src/inspector_chrome_build/TimelinePresentationModel.js
        typeToCategory.put("Root", Category.Loading);
        typeToCategory.put("Program", Category.Other);
        typeToCategory.put("EventDispatch", Category.Scripting);
        typeToCategory.put("BeginFrame", Category.Rendering);
        typeToCategory.put("ScheduleStyleRecalculation", Category.Rendering);
        typeToCategory.put("RecalculateStyles", Category.Rendering);
        typeToCategory.put("InvalidateLayout", Category.Rendering);
        typeToCategory.put("Layout", Category.Rendering);
        typeToCategory.put("AutosizeText", Category.Rendering);
        typeToCategory.put("PaintSetup", Category.Painting);
        typeToCategory.put("Paint", Category.Painting);
        typeToCategory.put("Rasterize", Category.Painting);
        typeToCategory.put("ScrollLayer", Category.Rendering);
        typeToCategory.put("DecodeImage", Category.Painting);
        typeToCategory.put("ResizeImage", Category.Painting);
        typeToCategory.put("CompositeLayers", Category.Painting);
        typeToCategory.put("ParseHTML", Category.Loading);
        typeToCategory.put("TimerInstall", Category.Scripting);
        typeToCategory.put("TimerRemove", Category.Scripting);
        typeToCategory.put("TimerFire", Category.Scripting);
        typeToCategory.put("XHRReadyStateChange", Category.Scripting);
        typeToCategory.put("XHRLoad", Category.Scripting);
        typeToCategory.put("EvaluateScript", Category.Scripting);
        typeToCategory.put("ResourceSendRequest", Category.Loading);
        typeToCategory.put("ResourceReceiveResponse", Category.Loading);
        typeToCategory.put("ResourceFinish", Category.Loading);
        typeToCategory.put("FunctionCall", Category.Scripting);
        typeToCategory.put("ResourceReceivedData", Category.Loading);
        typeToCategory.put("GCEvent", Category.Scripting);
        typeToCategory.put("MarkDOMContent", Category.Scripting);
        typeToCategory.put("MarkLoad", Category.Scripting);
        typeToCategory.put("MarkFirstPaint", Category.Painting);
        typeToCategory.put("TimeStamp", Category.Scripting);
        typeToCategory.put("Time", Category.Scripting);
        typeToCategory.put("TimeEnd", Category.Scripting);
        typeToCategory.put("ScheduleResourceRequest", Category.Loading);
        typeToCategory.put("RequestAnimationFrame", Category.Scripting);
        typeToCategory.put("CancelAnimationFrame", Category.Scripting);
        typeToCategory.put("FireAnimationFrame", Category.Scripting);
        typeToCategory.put("WebSocketCreate", Category.Scripting);
        typeToCategory.put("WebSocketSendHandshakeRequeset", Category.Scripting);
        typeToCategory.put("WebSocketReceiveHandshakeResponse", Category.Scripting);
        typeToCategory.put("WebSocketDestroy", Category.Scripting);

        // new?:
        typeToCategory.put("ActivateLayerTree", Category.Rendering);
        typeToCategory.put("DrawFrame", Category.Rendering);
        typeToCategory.put("RequestMainThreadFrame", Category.Rendering);
        typeToCategory.put("UpdateLayerTree", Category.Rendering);
    }

    /**
     * @param type the timeline event record type:
     *            https://developers.google.com/chrome-developer-tools/docs/timeline#timeline_event_reference
     * @return timeline category
     */
    public static Category toCategory(String type) {
        if (!typeToCategory.containsKey(type)) {
            LOG.info("unknown category for: " + type);
            return Category.Other;
        }
        return typeToCategory.get(type);
    }

    /**
     * 
     * @return the full metric name, i.e. "Timeline.Rendering.Layout"
     */
    public static String toMetricName(String type) {
        return "Timeline." + toCategory(type) + '.' + type;
    }

    /**
     * @return all the timeline event types for the category
     */
    public static List<String> getCategoryTypes(Category category) {
        List<String> types = Lists.newArrayList();
        for (String type : typeToCategory.keySet()) {
            if (toCategory(type) == category) {
                types.add(type);
            }
        }
        return types;
    }

    /**
     * @return all the metric names for the category
     */
    public static List<String> getCategoryMetricNames(Category category) {
        List<String> types = Lists.newArrayList();
        for (String type : typeToCategory.keySet()) {
            if (toCategory(type) == category) {
                types.add(toMetricName(type));
            }
        }
        return types;
    }

    /**
     * @return null if it is not a time stamp, else the message in the time stamp
     */
    public static String isTimelineTimeStamp(JSONObject timelineEvent) {
        try {
            if (!"TimeStamp".equals(timelineEvent.getString("type"))) {
                return null;
            }
            return timelineEvent.getJSONObject("data").getString("message");
        } catch (JSONException e) {
            throw new RuntimeException(timelineEvent.toString(), e);
        }
    }

    /**
     * @return true if the timelineEvent is a time stamp with the given message
     */
    public static boolean isTimelineTimeStamp(JSONObject timelineEvent, String message) {
        if (message == null) {
            return false;
        }
        return message.equals(isTimelineTimeStamp(timelineEvent));
    }

    /**
     * @return true if the timelineEvent or one of its descendants is a time stamp with the given message
     */
    public static boolean containsTimelineTimeStamp(JSONObject timelineEvent, String message) {
        if (isTimelineTimeStamp(timelineEvent, message)) {
            return true;
        }

        if (timelineEvent.has("children")) {
            try {
                JSONArray children = timelineEvent.getJSONArray("children");
                for (int i = 0; i < children.length(); i++) {
                    if (containsTimelineTimeStamp(children.getJSONObject(i), message)) {
                        return true;
                    }
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        }

        return false;
    }
}
