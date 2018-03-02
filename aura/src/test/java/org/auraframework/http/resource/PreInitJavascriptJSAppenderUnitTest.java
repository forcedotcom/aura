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
package org.auraframework.http.resource;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.javascript.PreInitJavascript;
import org.auraframework.system.AuraContext;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Matchers;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import java.util.ArrayList;
import java.util.List;

import static junit.framework.TestCase.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;


@RunWith(PowerMockRunner.class)
@PrepareForTest(PreInitJavascriptJSAppender.class)
public class PreInitJavascriptJSAppenderUnitTest {

    @Test
    public void testProgrammaticPreInitJavascriptInsertion() throws Exception {
        AuraContext auraContext = PowerMockito.mock(AuraContext.class);
        PowerMockito.when(auraContext.getLoadingApplicationDescriptor()).thenReturn(null);
        PowerMockito.when(auraContext.isTestMode()).thenReturn(true);

        String expectedCode = "console.log('WOOHOO!');";
        PreInitJavascript javascript = PowerMockito.mock(PreInitJavascript.class);
        PowerMockito.when(javascript.shouldInsert(any(), any())).thenReturn(true);
        PowerMockito.when(javascript.getJavascriptCode(any(), any())).thenReturn(expectedCode);

        List<PreInitJavascript> preInitJavascripts = new ArrayList<>();
        preInitJavascripts.add(javascript);

        PreInitJavascriptJSAppender inlineJs = setupMockPreInitJavascriptAppender();
        inlineJs.setPreInitJavascripts(preInitJavascripts);


        StringBuilder out = new StringBuilder();
        inlineJs.append(mock(BaseComponentDef.class),auraContext, out);

        String content = out.toString();

        assertTrue("Aura global javascript object needs to be checked", content.contains("window.Aura = window.Aura || {};"));
        assertTrue("Aura.beforeFrameworkInit array needs to be checked", content.contains("window.Aura.beforeFrameworkInit = Aura.beforeFrameworkInit || [];"));
        assertTrue("Response does not contain inserted javascript", content.contains(expectedCode));
    }

    @Test
    public void testNoInsertPreInitJavascriptInsertion() throws Exception {
        AuraContext auraContext = PowerMockito.mock(AuraContext.class);
        PowerMockito.when(auraContext.getLoadingApplicationDescriptor()).thenReturn(null);
        PowerMockito.when(auraContext.isTestMode()).thenReturn(true);

        String expectedCode = "console.log('WOOHOO!');";
        PreInitJavascript javascript = PowerMockito.mock(PreInitJavascript.class);
        PowerMockito.when(javascript.shouldInsert(any(), any())).thenReturn(false);

        List<PreInitJavascript> preInitJavascripts = new ArrayList<>();
        preInitJavascripts.add(javascript);

        PreInitJavascriptJSAppender inlineJs = setupMockPreInitJavascriptAppender();
        inlineJs.setPreInitJavascripts(preInitJavascripts);

        StringBuilder out = new StringBuilder();
        inlineJs.append(mock(BaseComponentDef.class),auraContext,out);
        String content = out.toString();

        assertTrue("Response should not contain javascript", !content.contains(expectedCode));
    }

    @Test
    public void testEmptyPreInitJavascriptInsertion() throws Exception {
        AuraContext auraContext = PowerMockito.mock(AuraContext.class);
        PowerMockito.when(auraContext.getLoadingApplicationDescriptor()).thenReturn(null);
        PowerMockito.when(auraContext.isTestMode()).thenReturn(true);

        PreInitJavascript javascript = PowerMockito.mock(PreInitJavascript.class);
        PowerMockito.when(javascript.shouldInsert(any(), any())).thenReturn(true);
        PowerMockito.when(javascript.getJavascriptCode(any(), any())).thenReturn("");

        List<PreInitJavascript> preInitJavascripts = new ArrayList<>();
        preInitJavascripts.add(javascript);

        PreInitJavascriptJSAppender appender = new PreInitJavascriptJSAppender();
        appender.setPreInitJavascripts(preInitJavascripts);

        StringBuilder out = new StringBuilder();

        appender.append(mock(BaseComponentDef.class), auraContext, out);

        String content = out.toString();
        assertTrue("Response should not contain beforeFrameworkInit", !content.contains("beforeFrameworkInit"));
    }

    private PreInitJavascriptJSAppender setupMockPreInitJavascriptAppender() throws Exception {
        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        Mockito.when(configAdapter.validateBootstrap(Matchers.anyString())).thenReturn(true);

        PreInitJavascriptJSAppender inline = new PreInitJavascriptJSAppender();
        PreInitJavascriptJSAppender inlineSpy = PowerMockito.spy(inline);

        return inlineSpy;
    }
}
