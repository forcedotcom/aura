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
package org.auraframework.util.javascript.directive;

import java.util.HashSet;

import org.auraframework.test.UnitTestCase;

/**
 * Automation to verify JavascriptGeneratorMode class.
 * 
 * 
 * @since 0.0.207
 */
public class JavascriptGeneratorModeTest extends UnitTestCase {
    /**
     * Verify that all modes have a unique suffix. Javascript generation for
     * various modes is parallelized. If two modes use the same suffix,
     * generation can cause exceptions.
     */
    public void testUniqueSuffix() {
        HashSet<String> suffixes = new HashSet<String>();
        for (JavascriptGeneratorMode m : JavascriptGeneratorMode.values()) {
            if (suffixes.contains(m.getSuffix())) {
                fail("JavascriptGeneratorMode: Two modes should not use same suffix. Reused suffix is :"
                        + m.getSuffix());
            }
            suffixes.add(m.getSuffix());
        }
    }
}
