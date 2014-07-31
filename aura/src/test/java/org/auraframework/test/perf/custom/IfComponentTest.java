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
package org.auraframework.test.perf.custom;

import org.auraframework.test.perf.core.CustomPerfAbstractTestCase;

public final class IfComponentTest extends CustomPerfAbstractTestCase {

    public IfComponentTest(String name) {
        super(name, getDefDescriptor("performanceTest:aura_if"));
    }

    public void testIf() throws Throwable {
        auraUITestingUtil.getRawEval("var c = $A.PERFCORE.getCreatedComponent(); c.set('v.enabled', true)");
    }

    public void testElse() throws Throwable {
        auraUITestingUtil
                .getRawEval("var c = $A.PERFCORE.getCreatedComponent(); c.set('v.branch', false); c.set('v.enabled', true)");
    }
}
