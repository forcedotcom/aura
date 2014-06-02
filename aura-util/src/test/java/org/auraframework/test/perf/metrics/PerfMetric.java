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
package org.auraframework.test.perf.metrics;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.base.Objects;

/**
 * Represents a performance metric
 */
public class PerfMetric extends JSONObject implements Comparable<PerfMetric> {

    public static final String DETAILS = "details";

    public PerfMetric() {
    }

    /**
     * @param source json serialized metric
     */
    public PerfMetric(String source) throws JSONException {
        super(source);
    }

    public PerfMetric(String name, Object value) {
        this(name, value, null);
    }

    public PerfMetric(String name, Object value, String units) {
        setName(name);
        setValue(value, units);
    }

    public final String getName() {
        try {
            return getString("name");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public final int getIntValue() {
        try {
            return getInt("value");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public final Object getValue() {
        try {
            return get("value");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public final String getUnits() {
        try {
            return has("units") ? getString("units") : null;
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * @return details that show where the single metric value comes from
     */
    public final JSONArray getDetails() {
        try {
            return has(DETAILS) ? getJSONArray(DETAILS) : null;
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public final void setName(String name) {
        try {
            put("name", name);
        } catch (JSONException e) {
            throw new RuntimeException(name, e);
        }
    }

    public final void setValue(Object value) {
        setValue(value, null);
    }

    public final void setValue(Object value, String units) {
        try {
            put("value", value);
            if (units != null) {
                put("units", units);
            }
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public final void setDetails(JSONArray details) {
        try {
            put(DETAILS, details);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * @return short text describing the metric, i.e. "metricName 5"
     */
    public String toShortText() {
        return getName() + ' ' + getValue();
    }

    public String toLongText() {
        StringBuilder sb = new StringBuilder(getName() + ' ' + getValue());
        String units = getUnits();
        if (units != null) {
            sb.append(' ' + units);
        }
        sb.append(toDetailsText(null));
        return sb.toString();
    }

    public String toDetailsText(String prefix) {
        JSONArray details = getDetails();
        if (details == null) {
            return null;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("  ");
        if (prefix != null) {
            sb.append(prefix + ' ');
        }
        sb.append("details:");
        for (int i = 0; i < details.length(); i++) {
            try {
                sb.append("\n    " + details.get(i));
            } catch (JSONException e) {
                throw new RuntimeException(details.toString(), e);
            }
        }
        return sb.toString();
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof PerfMetric)) {
            return false;
        }
        PerfMetric otherMetric = (PerfMetric) other;
        if (!getName().equals(otherMetric.getName())) {
            return false;
        }
        if (!getValue().equals(otherMetric.getValue())) {
            return false;
        }
        return Objects.equal(getUnits(), otherMetric.getUnits());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getName(), getValue(), getUnits());
    }

    @Override
    public final int compareTo(PerfMetric other) {
        return getIntValue() - other.getIntValue();
    }
}
