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
package org.auraframework.http.cspinlining;

import static org.auraframework.service.CSPInliningService.InlineScriptMode.NONCE;
import static org.auraframework.service.CSPInliningService.InlineScriptMode.UNSAFEINLINE;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.CSPInliningService.InlineScriptMode;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.junit.Test;

public class CSPInliningAISRuleTest {
    @Test
    public void testIsRelevantNoAppDescriptor(){
        AuraContext context = mock(AuraContext.class);
        CSPInliningCriteria criteria = new CSPInliningCriteria(context);
        CSPInliningAISRule target = new CSPInliningAISRule();

        boolean expected = false;
        boolean actual = target.isRelevant(criteria);

        assertEquals("CSPInliningAISRule should not have been relevant without an app descriptor", expected, actual);
    }

    @Test
    public void testIsRelevantAlreadyUnsafeInline(){
        AuraContext context = mock(AuraContext.class);
        CSPInliningAISRule target = new CSPInliningAISRule();
        DefDescriptor<ApplicationDef> appDefDescriptor = mock(ApplicationDefDescriptor.class);

        doReturn(appDefDescriptor).when(context).getApplicationDescriptor();

        CSPInliningCriteria criteria = new CSPInliningCriteria(context);
        criteria.setMode(UNSAFEINLINE);

        boolean expected = false;
        boolean actual = target.isRelevant(criteria);

        assertEquals("CSPInliningAISRule should not have been relevant as it is already unsafeinline", expected, actual);
    }

    @Test
    public void testProcess() throws Exception{
        AuraContext context = mock(AuraContext.class);
        CSPInliningAISRule target = new CSPInliningAISRule();
        DefDescriptor<ApplicationDef> appDefDescriptor = mock(ApplicationDefDescriptor.class);
        DefDescriptor<ApplicationDef> aisDefDescriptor = mock(ApplicationDefDescriptor.class);
        DefinitionService definitionService = mock(DefinitionService.class);
        BaseComponentDef appComponentDef = mock(BaseComponentDef.class);

        target.setDefinitionService(definitionService);

        doReturn(appDefDescriptor).when(context).getApplicationDescriptor();
        when(definitionService.getDefDescriptor("aura:integrationServiceApp", ApplicationDef.class)).thenReturn(aisDefDescriptor);
        doReturn(appComponentDef).when(definitionService).getDefinition(appDefDescriptor);
        when(appComponentDef.isInstanceOf(aisDefDescriptor)).thenReturn(true);

        CSPInliningCriteria criteria = new CSPInliningCriteria(context);
        criteria.setMode(NONCE);

        target.process(criteria);

        InlineScriptMode expected = UNSAFEINLINE;
        InlineScriptMode actual = criteria.getMode();

        assertEquals("CSPInliningAISRule should have set mode to unsafeinline given that AIS was detected", expected, actual);
    }

    @Test
    public void testProcessNotAis() throws Exception{
        AuraContext context = mock(AuraContext.class);
        CSPInliningAISRule target = new CSPInliningAISRule();
        DefDescriptor<ApplicationDef> appDefDescriptor = mock(ApplicationDefDescriptor.class);
        DefDescriptor<ApplicationDef> aisDefDescriptor = mock(ApplicationDefDescriptor.class);
        DefinitionService definitionService = mock(DefinitionService.class);
        BaseComponentDef appComponentDef = mock(BaseComponentDef.class);

        target.setDefinitionService(definitionService);

        doReturn(appDefDescriptor).when(context).getApplicationDescriptor();
        when(definitionService.getDefDescriptor("aura:integrationServiceApp", ApplicationDef.class)).thenReturn(aisDefDescriptor);
        doReturn(appComponentDef).when(definitionService).getDefinition(appDefDescriptor);
        when(appComponentDef.isInstanceOf(aisDefDescriptor)).thenReturn(false);

        CSPInliningCriteria criteria = new CSPInliningCriteria(context);
        criteria.setMode(NONCE);

        target.process(criteria);

        InlineScriptMode notExpected = UNSAFEINLINE;
        InlineScriptMode actual = criteria.getMode();

        assertNotEquals("CSPInliningAISRule should have not been set mode to unsafeinline given that AIS was not detected", notExpected, actual);
    }

    interface ApplicationDefDescriptor extends DefDescriptor<ApplicationDef>{}
}
