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
package org.auraframework.impl.expression.functions;

/**
 * Helper functions to match javascript
 */
public class JavascriptHelpers {
    /**
     * Convert doubles into whatever fits best.
     *
     * This mimics the behaviour of JS when turning a number into a string.
     * Other that this corner case, we leave numbers as doubles to preserve sign
     * bizarreness.
     *
     * @param value the double value to wrap.
     * @return one of Double, Integer or Long that maps the double into the most appropriate value.
     */
    public static Number getNumber(double value) {
        if (value == (int)Math.round(value)) {
            return Integer.valueOf((int)value);
        } else if (value == Math.round(value)) {
            return Long.valueOf((long)value);
        } else {
            return Double.valueOf(value);
        }
    }

    /**
     * A helper to turn things into strings.
     *
     * This tries to track the behaviour of JS, including -0.0 being preserved as -0. We do have a hard
     * limit on the depth of the stack, but that is generally irrelevant. In fact, we maybe want to throw
     * exceptions on objects, but for the moment we do not.
     *
     * @param o the object to turn into a string.
     * @param depth the current stack depth.
     */
    private static String stringifyHelper(Object o, int depth) {
        if (depth > 3) {
            return "Too Deep";
        }
        if (o instanceof Number) {
        	Number n = (Number)o;
        	
                // Oh fun. Don't know of another way to detect this.
        	if (n.doubleValue() == 0 && (1.0/n.doubleValue() == Double.NEGATIVE_INFINITY)) {
        	    return "-0";
        	}
            return String.valueOf(getNumber(n.doubleValue()));
        } else if (o instanceof Iterable) {
            String comma = "";
            StringBuffer sb = new StringBuffer();

            for (Object x : ((Iterable<?>)o)) {
                sb.append(comma);
                sb.append(stringifyHelper(x, depth+1));
                comma = ",";
            }
            return sb.toString();
        } else if (o instanceof String) {
            return (String)o;
        } else if (o == null) {
            return "";
        } else {
            return "[object Object]";
        }
    }


    /**
     * The public method to strigify an object JS style.
     *
     * @param o the object to stringify.
     * @return the string version approximating JS.
     */
    public static String stringify(Object o) {
        if (o == null) {
            return "null";
        }
        return stringifyHelper(o, 0);
    }

    /**
     * Convert an object into a number by JSs conversion rules.
     *
     * @param o the object to convert.
     * @return a number.
     */
    public static Number convertToNumber(Object o) {
        if (o == null || "".equals(o)) {
            return Double.valueOf(0);
        }
        if (o instanceof Number) {
            return (Number)o;
        } else if (o instanceof Boolean) {
            if (((Boolean)o).booleanValue()) {
                return Double.valueOf(1);
            } else {
                return Double.valueOf(0);
            }
        } else {
            String s = stringify(o);
            try {
                return new Double(Double.parseDouble(s));
            } catch (NumberFormatException nfe) {
                return Double.NaN;
            }
        }
    }
}
