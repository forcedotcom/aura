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
package org.auraframework.service;

import org.junit.Ignore;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;

public class AuraSerializationServiceTest extends AuraImplTestCase {

    public AuraSerializationServiceTest(String name) {
        super(name);
    }

    /**
     * Testing the writeJson method. Write a complex component, serialize it and create a gold file of the json.
     * @hierarchy Aura.Runtime.Service
     * @userStory AuraServlet: POST
     */
    @Ignore
    public void testWriteJson() throws Exception{
        Component component = Aura.getInstanceService().getInstance("auratest:testComponent1",ComponentDef.class, null);
        StringBuffer out = new StringBuffer();
        Aura.getSerializationService().write(component, null, Component.class, out);
        goldFileJson(out.toString());
    }

    public void testWriteJsonActionAppendable() {
        //TODO when we can access apex controllers from main-aura-test
    }

    public void testReadAction() {
        //TODO when we can access apex controllers from main-aura-test
    }

}
