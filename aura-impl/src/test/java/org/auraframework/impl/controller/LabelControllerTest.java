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
package org.auraframework.impl.controller;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Action;
import org.auraframework.instance.Action.State;
import org.auraframework.test.annotation.UnAdaptableTest;

import com.google.common.collect.Maps;

/**
 * 
 * Unit Tests for LabelController.
 *
 */
@UnAdaptableTest
//Missing labels behave differently in SFDC stack
public class LabelControllerTest extends AuraImplTestCase {
    DefDescriptor<ControllerDef> labelCntrDesc = DefDescriptorImpl.getInstance(
            "java://org.auraframework.impl.controller.LabelController", ControllerDef.class);
    String getLabelDesc = "java://org.auraframework.impl.controller.LabelController/ACTION$getLabel";
    String placeholder = "FIXME - LocalizationAdapter.getLabel() needs implementation!";
    
    public LabelControllerTest(String name){
        super(name);
    }
    
    public void testLabelController() throws Exception{
        ControllerDef def = labelCntrDesc.getDef();
        assertNotNull("Failed to fetch the definition of the Label Controller.", def);
        runLabelAction("Related_Lists", "task_mode_today", State.SUCCESS, "Today");
    }
    
    public void testInvalidSection() throws Exception{
        runLabelAction("FOO", "task_mode_today", State.SUCCESS, "Today"); //In Aura, section doesn't matter
        runLabelAction("FOO", null, State.SUCCESS, placeholder);
        runLabelAction("FOO", "" , State.SUCCESS, placeholder);
    }
    
    public void testInvalidLabel() throws Exception{
        runLabelAction("Related_Lists", "FooBared", State.SUCCESS, placeholder);
        runLabelAction("FooBared", "FooBared", State.SUCCESS, placeholder);
        runLabelAction(null, "FooBared" , State.SUCCESS, placeholder);
        runLabelAction("", "FooBared" , State.SUCCESS, placeholder);
    }
    
    public Action runLabelAction(String section, String name, State expectedStatus, String expectedLabel) throws Exception{
        Map<String, Object> params = Maps.newHashMap();
        params.put("section", section);
        params.put("name", name);
        
        Action instance = (Action) Aura.getInstanceService().getInstance(getLabelDesc,
                ActionDef.class, params);
        instance.run();
        assertEquals(State.SUCCESS, expectedStatus);
        assertEquals(expectedLabel, instance.getReturnValue());
        
        return instance;
    }
}
