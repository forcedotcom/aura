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
package org.auraframework.test.perf;

import java.lang.reflect.Method;

import junit.framework.TestCase;

import org.auraframework.test.annotation.PerfTest;

public final class PerfUtil {

    // TODO: remove this once the chromedriver that supports profiling is released
    public static final boolean MEASURE_JSCPU_METRICTS = System.getProperty("perf.measure.jscpu") != null;

    /**
     * @return true if the test has the @PerfTest annotation
     */
    public static boolean hasPerfTestAnnotation(TestCase test) {
        try {
            Class<? extends TestCase> testClass = test.getClass();
            Method method = testClass.getMethod(test.getName());
            return method.getAnnotation(PerfTest.class) != null || testClass.getAnnotation(PerfTest.class) != null;
        } catch (NoSuchMethodException ignore) {
            // happens for automatically generated tests
            return false;
        }
    }

    /**
     * Gets elapsed millis from the times on the timeline
     * 
     * @param startTime i.e. "1.3976003351064231E12"
     * @param endTime i.e. "1.3976003351068398E12"
     */
    public static long elapsedMicros(String startTime, String endTime) {
        return (long) ((new Double(endTime) - new Double(startTime)) * 1000);
    }
}
