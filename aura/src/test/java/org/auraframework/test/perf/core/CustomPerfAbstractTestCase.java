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
package org.auraframework.test.perf.core;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.test.annotation.PerfCustomTest;
import org.auraframework.test.perf.metrics.PerfMetricsComparator;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.base.Function;

/**
 * Base class for Aura WebDriver tests.
 */
@PerfCustomTest
public abstract class CustomPerfAbstractTestCase extends AbstractPerfTestCase {

    private static final String PERF_START_MARKER_SUFFIX = ":start";
    private static final String PERF_END_MARKER_SUFFIX = ":end";

    protected DefDescriptor<ComponentDef> descriptor;

    public CustomPerfAbstractTestCase(String name) {
        super(name);
    }

    public CustomPerfAbstractTestCase(String name, DefDescriptor<ComponentDef> desc) {
        super(name);
        descriptor = desc;
    }

    public void setComponentDef(DefDescriptor<ComponentDef> d) {
        descriptor = d;
    }

    @Override
    protected void superRunTest() throws Throwable {
        runWithPerfApp(descriptor);
        profileStart(getPerfStartMarker());

        super.superRunTest();

        profileEnd(getPerfEndMarker());
    }

    @Override
    public String getPerfStartMarker() {
        return this.getName() + PERF_START_MARKER_SUFFIX;
    }

    @Override
    public String getPerfEndMarker() {
        return this.getName() + PERF_END_MARKER_SUFFIX;
    }

    @Override
    public final String getGoldFileName() {
        return descriptor.getNamespace() + '/' + descriptor.getName() + '_' + this.getName();
    }

    @Override
    public PerfMetricsComparator getPerfMetricsComparator() {
        return CUSTOM_COMPARATOR;
    }

    private static final PerfMetricsComparator CUSTOM_COMPARATOR = new PerfMetricsComparator() {
        @Override
        protected int getAllowedVariability(String metricName) {
            // TODO: allow bigger variability if necessary
            return super.getAllowedVariability(metricName);
        }
    };

    protected final <V> V waitUntil(final Function<? super WebDriver, V> function) {
        return new WebDriverWait(currentDriver, timeoutInSecs)
                .until(new Function<WebDriver, V>() {
                    @Override
                    public V apply(WebDriver d) {
                        return function.apply(d);
                    }
                });
    }
}
