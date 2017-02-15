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

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.util.json.DefaultJsonSerializationContext;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Maps;

public class BootstrapUnitTest extends UnitTestCase {
    @Test
    public void testName() {
        assertEquals("bootstrap.js", new Bootstrap().getName());
    }

    @Test
    public void testFormat() {
        assertEquals(Format.JS, new Bootstrap().getFormat());
    }

    @Test
    public void testPublicCacheExpirationNotSet() throws Exception {
        verifyCacheHeaders(null, false);
    }

    @Test
    public void testPublicCacheExpirationZero() throws Exception {
        verifyCacheHeaders(0, false);
    }

    @Test
    public void testPublicCacheExpirationValidValue() throws Exception {
        verifyCacheHeaders(600, true);
    }

    @Test
    public void testWriteCsrfTokenIfManifestEnabled() throws Exception {
        String jwtToken = "jwtToken";
        String csrfToken = "specialCsrfToken";
        Bootstrap bootstrap = new Bootstrap() {
            @Override
            protected Map<String, Object> getComponentAttributes(HttpServletRequest request) {
                return Maps.newHashMap();
            }

            @Override
            public Boolean loadLabels() {
                return true;
            }
        };

        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        StringWriter writer = new StringWriter();
        Mockito.doReturn(new PrintWriter(writer)).when(response).getWriter();

        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        Mockito.doReturn(jwtToken).when(request).getParameter("jwt");

        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.doReturn(true).when(configAdapter).validateBootstrap(jwtToken);
        Mockito.doReturn(csrfToken).when(configAdapter).getCSRFToken();
        Mockito.doReturn(true).when(configAdapter).isClientAppcacheEnabled();
        bootstrap.setConfigAdapter(configAdapter);

        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        bootstrap.setServletUtilAdapter(servletUtilAdapter);

        InstanceService instanceService = Mockito.mock(InstanceService.class);
        bootstrap.setInstanceService(instanceService);

        @SuppressWarnings("unchecked")
        DefDescriptor<? extends BaseComponentDef> appDescriptor = Mockito.mock(DefDescriptor.class);
        ApplicationDef appDef = Mockito.mock(ApplicationDef.class);
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        Mockito.doReturn(DefType.APPLICATION).when(appDescriptor).getDefType();
        Mockito.doReturn(appDef).when(definitionService).getDefinition(appDescriptor);
        Mockito.doReturn(appDef).when(definitionService).getUnlinkedDefinition(appDescriptor);
        Mockito.doReturn(true).when(appDef).isAppcacheEnabled();
        bootstrap.setDefinitionService(definitionService);

        AuraContext context = Mockito.mock(AuraContext.class);
        InstanceStack instanceStack = Mockito.mock(InstanceStack.class);
        Mockito.doReturn(appDescriptor).when(context).getApplicationDescriptor();
        Mockito.doReturn(new DefaultJsonSerializationContext(true, true)).when(context).getJsonSerializationContext();
        Mockito.doReturn(instanceStack).when(context).getInstanceStack();

        ContextService contextService = Mockito.mock(ContextService.class);
        Mockito.doReturn(context).when(contextService).getCurrentContext();
        bootstrap.setContextService(contextService);

        bootstrap.initManifest();
        bootstrap.write(request, response, context);

        if (!writer.toString().contains("\"token\":\"" + csrfToken + "\"")) {
            fail("Missing CSRF token in payload: " + writer.toString());
        }
        Mockito.verify(configAdapter, Mockito.times(1)).getCSRFToken();
    }

    @Test
    public void testWriteNoCsrfTokenIfManifestDisabled() throws Exception {
        Bootstrap bootstrap = new Bootstrap() {
            @Override
            protected Map<String, Object> getComponentAttributes(HttpServletRequest request) {
                return Maps.newHashMap();
            }

            @Override
            public Boolean loadLabels() {
                return true;
            }
        };

        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        StringWriter writer = new StringWriter();
        Mockito.doReturn(new PrintWriter(writer)).when(response).getWriter();

        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);

        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.doReturn(false).when(configAdapter).isClientAppcacheEnabled();
        bootstrap.setConfigAdapter(configAdapter);

        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        bootstrap.setDefinitionService(definitionService);

        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        bootstrap.setServletUtilAdapter(servletUtilAdapter);

        InstanceService instanceService = Mockito.mock(InstanceService.class);
        bootstrap.setInstanceService(instanceService);

        @SuppressWarnings("unchecked")
        DefDescriptor<? extends BaseComponentDef> appDescriptor = Mockito.mock(DefDescriptor.class);
        ApplicationDef appDef = Mockito.mock(ApplicationDef.class);
        Mockito.doReturn(DefType.APPLICATION).when(appDescriptor).getDefType();
        Mockito.doReturn(appDef).when(definitionService).getDefinition(appDescriptor);

        AuraContext context = Mockito.mock(AuraContext.class);
        InstanceStack instanceStack = Mockito.mock(InstanceStack.class);
        Mockito.doReturn(appDescriptor).when(context).getApplicationDescriptor();
        Mockito.doReturn(new DefaultJsonSerializationContext(true, true)).when(context).getJsonSerializationContext();
        Mockito.doReturn(instanceStack).when(context).getInstanceStack();

        bootstrap.write(request, response, context);

        if (writer.toString().contains("\"token\":")) {
            fail("CSRF token should not be in payload: " + writer.toString());
        }
        Mockito.verify(configAdapter, Mockito.never()).getCSRFToken();
    }

    @Test
    public void testWriteReturns404IfRequestHasInvalidJwtToken() throws Exception {
        String jwtToken = "jwtToken";
        Bootstrap bootstrap = new Bootstrap() {
            @Override
            protected Map<String, Object> getComponentAttributes(HttpServletRequest request) {
                return Maps.newHashMap();
            }

            @Override
            public Boolean loadLabels() {
                return true;
            }
        };

        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        StringWriter writer = new StringWriter();
        Mockito.doReturn(new PrintWriter(writer)).when(response).getWriter();

        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        Mockito.doReturn(jwtToken).when(request).getParameter("jwt");

        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.doReturn(false).when(configAdapter).validateBootstrap(jwtToken);
        bootstrap.setConfigAdapter(configAdapter);

        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        bootstrap.setDefinitionService(definitionService);

        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        bootstrap.setServletUtilAdapter(servletUtilAdapter);

        InstanceService instanceService = Mockito.mock(InstanceService.class);
        bootstrap.setInstanceService(instanceService);

        @SuppressWarnings("unchecked")
        DefDescriptor<? extends BaseComponentDef> appDescriptor = Mockito.mock(DefDescriptor.class);
        ApplicationDef appDef = Mockito.mock(ApplicationDef.class);
        Mockito.doReturn(DefType.APPLICATION).when(appDescriptor).getDefType();
        Mockito.doReturn(appDef).when(definitionService).getDefinition(appDescriptor);

        AuraContext context = Mockito.mock(AuraContext.class);
        InstanceStack instanceStack = Mockito.mock(InstanceStack.class);
        Mockito.doReturn(appDescriptor).when(context).getApplicationDescriptor();
        Mockito.doReturn(new DefaultJsonSerializationContext(true, true)).when(context).getJsonSerializationContext();
        Mockito.doReturn(instanceStack).when(context).getInstanceStack();

        bootstrap.write(request, response, context);

        Mockito.verify(servletUtilAdapter, Mockito.times(1)).send404(Mockito.any(), Mockito.eq(request),
                Mockito.eq(response));
    }

    /**
     * Verify logic setting cache-related HTTP headers in response.
     * 
     * @param expirationSetting
     *            expiration setting on the app definition
     * @param shouldCache
     *            expect there is caching based on expiration setting. false
     *            means there should be no cache.
     * @throws Exception
     */
    private void verifyCacheHeaders(Integer expirationSetting, boolean shouldCache) throws Exception {
        @SuppressWarnings("unchecked")
        DefDescriptor<ApplicationDef> appDefDesc = Mockito.mock(DefDescriptor.class);
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        ApplicationDef appDef = Mockito.mock(ApplicationDef.class);
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);

        Bootstrap bootstrap = new Bootstrap();
        bootstrap.setServletUtilAdapter(servletUtilAdapter);
        bootstrap.setDefinitionService(definitionService);

        Mockito.when(appDefDesc.getDefType()).thenReturn(DefType.APPLICATION);
        Mockito.when(definitionService.getDefinition(appDefDesc)).thenReturn(appDef);

        // Public cache expiration not set, should be no cache
        Mockito.when(appDef.getBootstrapPublicCacheExpiration()).thenReturn(expirationSetting);
        bootstrap.setCacheHeaders(response, appDefDesc);

        if (shouldCache) {
            Mockito.verify(servletUtilAdapter).setCacheTimeout(Mockito.any(HttpServletResponse.class),
                    Mockito.eq(expirationSetting.longValue() * 1000));
        } else {
            Mockito.verify(servletUtilAdapter).setNoCache(Mockito.any(HttpServletResponse.class));
        }
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
    }
}
