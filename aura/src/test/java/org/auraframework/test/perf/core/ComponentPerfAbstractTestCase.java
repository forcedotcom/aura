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
import org.auraframework.test.annotation.PerfCmpTest;

/**
 * Base class for Aura WebDriver tests.
 */
@PerfCmpTest
public abstract class ComponentPerfAbstractTestCase extends AbstractPerfTestCase {

    protected DefDescriptor<ComponentDef> descriptor;

    public ComponentPerfAbstractTestCase(String name) {
        super(name);
    }

    public ComponentPerfAbstractTestCase(String name, DefDescriptor<ComponentDef> desc) {
        super(name);
        descriptor = desc;
    }

    public abstract void testRun() throws Throwable;

    public void setComponentDef(DefDescriptor<ComponentDef> d) {
        descriptor = d;
    }

    @Override
    public final String getGoldFileName() {
        return descriptor.getNamespace() + '/' + descriptor.getName();
    }
}
