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

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;
import static junit.framework.TestCase.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.javascript.PreInitJavascript;
import org.auraframework.system.AuraContext;
import org.junit.Test;
import org.mockito.Matchers;

public class PreInitJavascriptJSAppenderUnitTest {

    @Test
    public void testProgrammaticPreInitJavascriptInsertion() throws Exception {
        AuraContext auraContext = mock(AuraContext.class);
        doReturn(null).when(auraContext).getLoadingApplicationDescriptor();
        doReturn(TRUE).when(auraContext).isTestMode();

        String expectedCode = "console.log('WOOHOO!');";
        PreInitJavascript javascript = mock(PreInitJavascript.class);
        doReturn(TRUE).when(javascript).shouldInsert(any(), any());
        doReturn(expectedCode).when(javascript).getJavascriptCode(any(), any());

        List<PreInitJavascript> preInitJavascripts = new ArrayList<>();
        preInitJavascripts.add(javascript);

        PreInitJavascriptJSAppender inlineJs = setupMockPreInitJavascriptAppender();
        inlineJs.setPreInitJavascripts(preInitJavascripts);


        StringBuilder out = new StringBuilder();
        inlineJs.append(mock(BaseComponentDef.class), auraContext, out);

        String content = out.toString();

        assertTrue("Aura global javascript object needs to be checked", content.contains("window.Aura = window.Aura || {};"));
        assertTrue("Aura.beforeFrameworkInit array needs to be checked", content.contains("window.Aura.beforeFrameworkInit = Aura.beforeFrameworkInit || [];"));
        assertTrue("Response does not contain inserted javascript", content.contains(expectedCode));
    }

    @Test
    public void testNoInsertPreInitJavascriptInsertion() throws Exception {
        AuraContext auraContext = mock(AuraContext.class);
        doReturn(null).when(auraContext).getLoadingApplicationDescriptor();
        doReturn(TRUE).when(auraContext).isTestMode();

        String expectedCode = "console.log('WOOHOO!');";
        PreInitJavascript javascript = mock(PreInitJavascript.class);
        doReturn(FALSE).when(javascript).shouldInsert(any(), any());

        List<PreInitJavascript> preInitJavascripts = new ArrayList<>();
        preInitJavascripts.add(javascript);

        PreInitJavascriptJSAppender inlineJs = setupMockPreInitJavascriptAppender();
        inlineJs.setPreInitJavascripts(preInitJavascripts);

        StringBuilder out = new StringBuilder();
        inlineJs.append(mock(BaseComponentDef.class), auraContext,out);
        String content = out.toString();

        assertTrue("Response should not contain javascript", !content.contains(expectedCode));
    }

    @Test
    public void testEmptyPreInitJavascriptInsertion() throws Exception {
        AuraContext auraContext = mock(AuraContext.class);
        doReturn(null).when(auraContext).getLoadingApplicationDescriptor();
        doReturn(TRUE).when(auraContext).isTestMode();

        PreInitJavascript javascript = mock(PreInitJavascript.class);
        doReturn(TRUE).when(javascript).shouldInsert(any(), any());
        doReturn("").when(javascript).getJavascriptCode(any(), any());

        List<PreInitJavascript> preInitJavascripts = new ArrayList<>();
        preInitJavascripts.add(javascript);

        PreInitJavascriptJSAppender appender = new PreInitJavascriptJSAppender();
        appender.setPreInitJavascripts(preInitJavascripts);

        StringBuilder out = new StringBuilder();

        appender.append(mock(BaseComponentDef.class), auraContext, out);

        String content = out.toString();
        assertTrue("Response should not contain beforeFrameworkInit", !content.contains("beforeFrameworkInit"));
    }

    private static PreInitJavascriptJSAppender setupMockPreInitJavascriptAppender() {
        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        doReturn(TRUE).when(configAdapter).validateBootstrap(Matchers.anyString());

        PreInitJavascriptJSAppender inline = new PreInitJavascriptJSAppender();
        PreInitJavascriptJSAppender inlineSpy = spy(inline);

        return inlineSpy;
    }
}
