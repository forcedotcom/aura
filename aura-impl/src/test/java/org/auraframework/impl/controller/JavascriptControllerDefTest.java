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
package org.auraframework.impl.controller;

import java.util.Map;

import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.controller.JavascriptActionDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef;
import org.auraframework.impl.system.DefDescriptorImpl;

/**
 * Test class to verify implementation of Javascript Controllers for component.
 * 
 * @hierarchy Aura.Components.Controllers
 * @priority medium
 * @userStory a0790000000DQHs
 */
public class JavascriptControllerDefTest extends AuraImplTestCase {
    public JavascriptControllerDefTest(String name) {
        super(name);
    }

    /**
     * Verify that Javascript Controller with comments is acceptable.
     * 
     * @hierarchy Aura.Unit Tests.Json StreamReader
     * @userStorySyncIdOrName a07B0000000DUGnIAO
     * @priority medium
     * @throws Exception
     */
    public void testControllerWithComments() throws Exception {
        DefDescriptor<ControllerDef> descriptor = DefDescriptorImpl.getInstance(
                "js://test.test_JSController_WithComments", ControllerDef.class);
        ControllerDef def = descriptor.getDef();
        assertNotNull("Failed to fetch the definition of the Javascript Controller.", def);
        assertTrue(def instanceof JavascriptControllerDef);
        Map<String, JavascriptActionDef> actions = ((JavascriptControllerDef) def).getActionDefs();
        assertTrue("Expected there be only two action in the javascript controller.", actions.size() == 2);
        assertNotNull("Expected action not present.", actions.get("functionName1"));
        assertNotNull("Expected action not present.", actions.get("functionName2"));
    }

}
