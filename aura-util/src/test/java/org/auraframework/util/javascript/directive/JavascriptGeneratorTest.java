/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import org.auraframework.test.UnitTestCase;

/**
 */
public class JavascriptGeneratorTest extends UnitTestCase {

    public JavascriptGeneratorTest(String name) {
        super(name);
    }

    public void testGeneration() throws Exception {
        TestGroup g = new TestGroup(getResourceFile("/testdata/directive/testGeneration.js"));
        g.parse();
        goldFileText(g.buildContent(JavascriptGeneratorMode.MOCK1), "_mock1.js");
        goldFileText(g.buildContent(JavascriptGeneratorMode.MOCK2), "_mock2.js");
    }
}
