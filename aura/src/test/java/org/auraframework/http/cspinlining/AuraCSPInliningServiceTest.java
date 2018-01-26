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

import static org.auraframework.service.CSPInliningService.InlineScriptMode.UNSUPPORTED;
import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.auraframework.service.CSPInliningService.InlineScriptMode;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.junit.Test;

import com.google.common.collect.Lists;

public class AuraCSPInliningServiceTest {

    @Test
    public void testEnsureEmptyRulesWhenCallingGetInlineMode(){
        AuraCSPInliningService target = new AuraCSPInliningService();
        ContextService contextService = mock(ContextService.class);

        target.setContextService(contextService);
        when(contextService.getCurrentContext()).thenReturn(mock(AuraContext.class));

        InlineScriptMode expected = UNSUPPORTED;
        InlineScriptMode actual = target.getInlineMode();

        assertEquals("Empty rules should have left the mode as unsupported", expected, actual);
    }

    @Test
    public void testEnsureOnlyRelevantRulesProcessed(){
        AuraCSPInliningService target = new AuraCSPInliningService();
        ContextService contextService = mock(ContextService.class);
        CSPInliningRule rule1 = mock(CSPInliningRule.class);
        CSPInliningRule rule2 = mock(CSPInliningRule.class);

        target.setContextService(contextService);
        target.setRules(Lists.newArrayList(rule1, rule2));
        when(contextService.getCurrentContext()).thenReturn(mock(AuraContext.class));
        when(rule1.isRelevant(any())).thenReturn(false);
        when(rule2.isRelevant(any())).thenReturn(true);

        target.getInlineMode();

        verify(rule1, never()).process(any());
        verify(rule2).process(any());
    }
}
