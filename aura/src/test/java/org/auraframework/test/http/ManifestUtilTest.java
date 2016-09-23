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
package org.auraframework.test.http;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.ManifestUtil;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

public class ManifestUtilTest extends UnitTestCase {
    @Mock
    ConfigAdapter configAdapter;

    @Mock
    ContextService contextService;

    @Mock
    AuraContext auraContext;

    @Mock
    @SuppressWarnings("rawtypes")
    DefDescriptor descriptor;

    @Mock
    HttpServletRequest request;

    @Mock
    HttpServletResponse response;

    @Mock
    DefinitionService definitionService;

    //public boolean isManifestEnabled()
    @Test
    public void testIsManifestEnabledWhenClientAppcacheDisabled() {
        Mockito.when(configAdapter.isClientAppcacheEnabled()).thenReturn(false);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        assertFalse(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenApplicationEnabled() throws Exception {
        ApplicationDef def = Mockito.mock(ApplicationDef.class);

        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContext);
        Mockito.when(configAdapter.isClientAppcacheEnabled()).thenReturn(true);
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.APPLICATION);
        Mockito.when(def.isAppcacheEnabled()).thenReturn(Boolean.TRUE);
        Mockito.when(definitionService.getUnlinkedDefinition((DefDescriptor<ApplicationDef>)descriptor)).thenReturn(def);
        Mockito.when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        assertTrue(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenApplicationDisabled() throws Exception {
        ApplicationDef def = Mockito.mock(ApplicationDef.class);

        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContext);
        Mockito.when(configAdapter.isClientAppcacheEnabled()).thenReturn(true);
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.APPLICATION);
        Mockito.when(def.isAppcacheEnabled()).thenReturn(Boolean.FALSE);
        Mockito.when(definitionService.getUnlinkedDefinition((DefDescriptor<ApplicationDef>)descriptor)).thenReturn(def);
        Mockito.when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        assertFalse(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenApplicationFlagNull() throws Exception {
        ApplicationDef def = Mockito.mock(ApplicationDef.class);

        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContext);
        Mockito.when(configAdapter.isClientAppcacheEnabled()).thenReturn(true);
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.APPLICATION);
        Mockito.when(def.isAppcacheEnabled()).thenReturn(null);
        Mockito.when(definitionService.getUnlinkedDefinition((DefDescriptor<ApplicationDef>)descriptor)).thenReturn(def);
        Mockito.when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        assertFalse(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenApplicationNull() throws Exception {
        ApplicationDef def = Mockito.mock(ApplicationDef.class);

        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContext);
        Mockito.when(configAdapter.isClientAppcacheEnabled()).thenReturn(true);
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.APPLICATION);
        Mockito.when(def.isAppcacheEnabled()).thenReturn(Boolean.TRUE);
        Mockito.when(definitionService.getUnlinkedDefinition((DefDescriptor<ApplicationDef>)descriptor)).thenReturn(def);
        Mockito.when(auraContext.getApplicationDescriptor()).thenReturn(null);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        assertFalse(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenComponent() throws Exception {
        ComponentDef def = Mockito.mock(ComponentDef.class);

        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContext);
        Mockito.when(configAdapter.isClientAppcacheEnabled()).thenReturn(true);
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.COMPONENT);
        Mockito.when(definitionService.getUnlinkedDefinition((DefDescriptor<ComponentDef>)descriptor)).thenReturn(def);
        Mockito.when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        assertFalse(value);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testCheckManifestCookie() {
        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContext);
        Mockito.when(descriptor.getNamespace()).thenReturn("ns");
        Mockito.when(descriptor.getName()).thenReturn("name");
        Mockito.when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);
        Mockito.when(auraContext.getMode()).thenReturn(Mode.PROD);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).checkManifestCookie(request, response);
        assertTrue(value);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testCheckManifestCookieWithErrorParam() {
        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContext);
        Mockito.when(descriptor.getNamespace()).thenReturn("ns");
        Mockito.when(descriptor.getName()).thenReturn("name");
        Mockito.when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);
        Mockito.when(auraContext.getMode()).thenReturn(Mode.PROD);

        Mockito.when(request.getParameter("aura.error")).thenReturn("error");

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).checkManifestCookie(request, response);
        assertFalse(value);

        // FIXME: verify that the cookie is added
        Mockito.verify(response, Mockito.times(1)).addCookie(Mockito.any());
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testCheckManifestCookieWithErrorCookie() {
        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContext);
        Mockito.when(descriptor.getNamespace()).thenReturn("ns");
        Mockito.when(descriptor.getName()).thenReturn("name");
        Mockito.when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);
        Mockito.when(auraContext.getMode()).thenReturn(Mode.PROD);

        Cookie cookie = new Cookie("ns_name_lm", "error");
        Cookie [] cookies = new Cookie[1];
        cookies[0] = cookie;

        Mockito.when(request.getCookies()).thenReturn(cookies);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).checkManifestCookie(request, response);
        assertFalse(value);

        // FIXME: verify that the cookie is deleted
        Mockito.verify(response, Mockito.times(1)).addCookie(Mockito.any());
    }
}
