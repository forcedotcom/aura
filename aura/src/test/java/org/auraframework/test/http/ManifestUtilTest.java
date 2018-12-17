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

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockHttpServletResponse;

public class ManifestUtilTest {
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

    @Before
    public void initMocks() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void testIsManifestEnabledWhenClientAppcacheDisabled() {
        doReturn(FALSE).when(configAdapter).isClientAppcacheEnabled();

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        Assert.assertFalse(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenApplicationEnabled() throws Exception {
        ApplicationDef def = mock(ApplicationDef.class);

        when(contextService.getCurrentContext()).thenReturn(auraContext);
        doReturn(TRUE).when(configAdapter).isClientAppcacheEnabled();
        when(descriptor.getDefType()).thenReturn(DefType.APPLICATION);
        when(def.isAppcacheEnabled()).thenReturn(Boolean.TRUE);
        when(definitionService.getUnlinkedDefinition((DefDescriptor<ApplicationDef>)descriptor)).thenReturn(def);
        when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        Assert.assertTrue(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenApplicationDisabled() throws Exception {
        ApplicationDef def = mock(ApplicationDef.class);

        when(contextService.getCurrentContext()).thenReturn(auraContext);
        doReturn(TRUE).when(configAdapter).isClientAppcacheEnabled();
        when(descriptor.getDefType()).thenReturn(DefType.APPLICATION);
        when(def.isAppcacheEnabled()).thenReturn(Boolean.FALSE);
        when(definitionService.getUnlinkedDefinition((DefDescriptor<ApplicationDef>)descriptor)).thenReturn(def);
        when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        Assert.assertFalse(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenApplicationFlagNull() throws Exception {
        ApplicationDef def = mock(ApplicationDef.class);

        when(contextService.getCurrentContext()).thenReturn(auraContext);
        doReturn(TRUE).when(configAdapter).isClientAppcacheEnabled();
        when(descriptor.getDefType()).thenReturn(DefType.APPLICATION);
        when(def.isAppcacheEnabled()).thenReturn(null);
        when(definitionService.getUnlinkedDefinition((DefDescriptor<ApplicationDef>)descriptor)).thenReturn(def);
        when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        Assert.assertFalse(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenApplicationNull() throws Exception {
        ApplicationDef def = mock(ApplicationDef.class);

        when(contextService.getCurrentContext()).thenReturn(auraContext);
        doReturn(TRUE).when(configAdapter).isClientAppcacheEnabled();
        when(descriptor.getDefType()).thenReturn(DefType.APPLICATION);
        when(def.isAppcacheEnabled()).thenReturn(Boolean.TRUE);
        when(definitionService.getUnlinkedDefinition((DefDescriptor<ApplicationDef>)descriptor)).thenReturn(def);
        when(auraContext.getApplicationDescriptor()).thenReturn(null);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        Assert.assertFalse(value);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testIsManifestEnabledWhenComponent() throws Exception {
        ComponentDef def = mock(ComponentDef.class);

        when(contextService.getCurrentContext()).thenReturn(auraContext);
        doReturn(TRUE).when(configAdapter).isClientAppcacheEnabled();
        when(descriptor.getDefType()).thenReturn(DefType.COMPONENT);
        when(definitionService.getUnlinkedDefinition((DefDescriptor<ComponentDef>)descriptor)).thenReturn(def);
        when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled();
        Assert.assertFalse(value);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testCheckManifestCookie() {
        when(contextService.getCurrentContext()).thenReturn(auraContext);
        when(descriptor.getNamespace()).thenReturn("ns");
        when(descriptor.getName()).thenReturn("name");
        when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);
        when(auraContext.getMode()).thenReturn(Mode.PROD);

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).checkManifestCookie(request, response);
        Assert.assertTrue(value);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testCheckManifestCookieWithErrorParam() {
        when(contextService.getCurrentContext()).thenReturn(auraContext);
        when(descriptor.getNamespace()).thenReturn("ns");
        when(descriptor.getName()).thenReturn("name");
        when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);
        when(auraContext.getMode()).thenReturn(Mode.PROD);

        when(request.getParameter("aura.error")).thenReturn("error");
        
        MockHttpServletResponse dummyResponse = new MockHttpServletResponse();
        
        ManifestUtil manifestUtil = new ManifestUtil(definitionService, contextService, configAdapter);
        boolean value = manifestUtil.checkManifestCookie(request, dummyResponse);
        Assert.assertFalse(value);

        Cookie cookie = dummyResponse.getCookie("ns_name_lm");
        Assert.assertEquals(cookie.getValue(), "error");
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testCheckManifestCookieWithErrorCookie() {
        when(contextService.getCurrentContext()).thenReturn(auraContext);
        when(descriptor.getNamespace()).thenReturn("ns");
        when(descriptor.getName()).thenReturn("name");
        when(auraContext.getApplicationDescriptor()).thenReturn(descriptor);
        when(auraContext.getMode()).thenReturn(Mode.PROD);

        Cookie cookie = new Cookie("ns_name_lm", "error");
        Cookie [] cookies = new Cookie[1];
        cookies[0] = cookie;

        when(request.getCookies()).thenReturn(cookies);
        
        MockHttpServletResponse dummyResponse = new MockHttpServletResponse();

        boolean value = new ManifestUtil(definitionService, contextService, configAdapter).checkManifestCookie(request, dummyResponse);
        Assert.assertFalse(value);

        Assert.assertEquals(dummyResponse.getCookie("ns_name_lm").getValue(), "");
    }
}
