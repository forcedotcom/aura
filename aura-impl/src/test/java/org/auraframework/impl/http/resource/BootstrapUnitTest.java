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
package org.auraframework.impl.http.resource;

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.verifyZeroInteractions;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExpressionBuilder;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.expression.PropertyReference;
import org.auraframework.http.BootstrapUtil;
import org.auraframework.instance.Action;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.Instance;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.Location;
import org.auraframework.util.json.DefaultJsonSerializationContext;
import org.auraframework.util.json.JsonEncoder;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

/**
 * Unit test for the {@link Bootstrap} class.
 */
@RunWith(MockitoJUnitRunner.class)
public class BootstrapUnitTest {

    @Mock
    BootstrapUtil bootstrapUtil;
    @Mock
    ExpressionBuilder expressionBuilder;
    
    @Test
    public void testName() {
        Assert.assertEquals("bootstrap.js", new Bootstrap(bootstrapUtil, expressionBuilder).getName());
        verifyZeroInteractions(bootstrapUtil, expressionBuilder);
    }

    @Test
    public void testFormat() {
        Assert.assertEquals(Format.JS, new Bootstrap(bootstrapUtil, expressionBuilder).getFormat());
        verifyZeroInteractions(bootstrapUtil, expressionBuilder);
    }

    @Test
    public void testPublicCacheExpirationNotSet() throws Exception {
        verifyCacheHeaders(null, false);
    }

    @Test
    public void testPublicCacheExpirationZero() throws Exception {
        verifyCacheHeaders(Integer.valueOf(0), false);
    }

    @Test
    public void testPublicCacheExpirationValidValue() throws Exception {
        verifyCacheHeaders(Integer.valueOf(600), true);
    }

    @Test
    public void testWriteCsrfTokenIfManifestEnabled() throws Exception {
        String jwtToken = "jwtToken";
        String csrfToken = "specialCsrfToken";
        
        final BootstrapUtil bootstrapUtil = spy(new BootstrapUtil());
        
        Bootstrap bootstrap = new Bootstrap(bootstrapUtil, expressionBuilder) {
            @Override
            protected Map<String, Object> getComponentAttributes(HttpServletRequest request) {
                return new HashMap<>();
            }
        };

        HttpServletResponse response = mock(HttpServletResponse.class);
        StringWriter writer = new StringWriter();
        doReturn(new PrintWriter(writer)).when(response).getWriter();

        HttpServletRequest request = mock(HttpServletRequest.class);
        doReturn(jwtToken).when(request).getParameter("jwt");

        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        doReturn(TRUE).when(configAdapter).validateBootstrap(jwtToken);
        doReturn(csrfToken).when(configAdapter).getCSRFToken();
        doReturn(TRUE).when(configAdapter).isClientAppcacheEnabled();
        bootstrap.setConfigAdapter(configAdapter);

        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        bootstrap.setServletUtilAdapter(servletUtilAdapter);

        InstanceService instanceService = mock(InstanceService.class);
        bootstrap.setInstanceService(instanceService);

        DefDescriptor<? extends BaseComponentDef> appDescriptor = mock(DefDescriptor.class);
        ApplicationDef appDef = mock(ApplicationDef.class);
        DefinitionService definitionService = mock(DefinitionService.class);
        doReturn(DefType.APPLICATION).when(appDescriptor).getDefType();
        doReturn(appDef).when(definitionService).getDefinition(appDescriptor);
        doReturn(appDef).when(definitionService).getUnlinkedDefinition(appDescriptor);
        doReturn(TRUE).when(appDef).isAppcacheEnabled();
        bootstrap.setDefinitionService(definitionService);

        AuraContext context = mock(AuraContext.class);
        Map<String, GlobalValueProvider> globalValueProviders = new HashMap<>();
        globalValueProviders.put(AuraValueProviderType.LABEL.getPrefix(), mock(GlobalValueProvider.class));
        InstanceStack instanceStack = mock(InstanceStack.class);
        doReturn(appDescriptor).when(context).getApplicationDescriptor();
        doReturn(new DefaultJsonSerializationContext(true, true)).when(context).getJsonSerializationContext();
        doReturn(instanceStack).when(context).getInstanceStack();
        doReturn(globalValueProviders).when(context).getGlobalProviders();

        ContextService contextService = mock(ContextService.class);
        doReturn(context).when(contextService).getCurrentContext();
        bootstrap.setContextService(contextService);

        bootstrap.initManifest();
        bootstrap.write(request, response, context);

        if (!writer.toString().contains("\"token\":\"" + csrfToken + "\"")) {
            Assert.fail("Missing CSRF token in payload: " + writer.toString());
        }
        verify(configAdapter).getCSRFToken();
        verify(bootstrapUtil).loadLabelsToContext(Matchers.same(context), Matchers.same(definitionService));
        verify(bootstrapUtil).getPrependScript();
        verify(bootstrapUtil).serializeApplication(Matchers.isNull(Instance.class), Matchers.isNull(Map.class), Matchers.same(context), Matchers.any(JsonEncoder.class));
        verify(bootstrapUtil).getAppendScript();
        verifyNoMoreInteractions(bootstrapUtil);
        verifyZeroInteractions(expressionBuilder);
    }

    @Test
    public void testWriteNoCsrfTokenIfManifestDisabled() throws Exception {
        Bootstrap bootstrap = new Bootstrap(bootstrapUtil, expressionBuilder) {
            @Override
            protected Map<String, Object> getComponentAttributes(HttpServletRequest request) {
                return Collections.emptyMap();
            }
        };

        HttpServletResponse response = mock(HttpServletResponse.class);
        StringWriter writer = new StringWriter();
        doReturn(new PrintWriter(writer)).when(response).getWriter();

        HttpServletRequest request = mock(HttpServletRequest.class);

        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        doReturn(FALSE).when(configAdapter).isClientAppcacheEnabled();
        bootstrap.setConfigAdapter(configAdapter);

        DefinitionService definitionService = mock(DefinitionService.class);
        bootstrap.setDefinitionService(definitionService);

        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        bootstrap.setServletUtilAdapter(servletUtilAdapter);

        InstanceService instanceService = mock(InstanceService.class);
        bootstrap.setInstanceService(instanceService);

        DefDescriptor<? extends BaseComponentDef> appDescriptor = mock(DefDescriptor.class);
        ApplicationDef appDef = mock(ApplicationDef.class);
        doReturn(DefType.APPLICATION).when(appDescriptor).getDefType();
        doReturn(appDef).when(definitionService).getDefinition(appDescriptor);

        AuraContext context = mock(AuraContext.class);
        InstanceStack instanceStack = mock(InstanceStack.class);
        doReturn(appDescriptor).when(context).getApplicationDescriptor();
        doReturn(new DefaultJsonSerializationContext(true, true)).when(context).getJsonSerializationContext();
        doReturn(instanceStack).when(context).getInstanceStack();

        bootstrap.write(request, response, context);

        if (writer.toString().contains("\"token\":")) {
            Assert.fail("CSRF token should not be in payload: " + writer.toString());
        }
        verify(configAdapter, never()).getCSRFToken();
        verifyZeroInteractions(bootstrapUtil, expressionBuilder);
    }

    @Test
    public void testWriteReturns404IfRequestHasInvalidJwtToken() throws Exception {
        String jwtToken = "jwtToken";
        Bootstrap bootstrap = new Bootstrap(bootstrapUtil, expressionBuilder) {
            @Override
            protected Map<String, Object> getComponentAttributes(HttpServletRequest request) {
                return Collections.emptyMap();
            }
        };

        HttpServletResponse response = mock(HttpServletResponse.class);
        StringWriter writer = new StringWriter();
        doReturn(new PrintWriter(writer)).when(response).getWriter();

        HttpServletRequest request = mock(HttpServletRequest.class);
        doReturn(jwtToken).when(request).getParameter("jwt");

        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        doReturn(FALSE).when(configAdapter).validateBootstrap(jwtToken);
        bootstrap.setConfigAdapter(configAdapter);

        DefinitionService definitionService = mock(DefinitionService.class);
        bootstrap.setDefinitionService(definitionService);

        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        bootstrap.setServletUtilAdapter(servletUtilAdapter);

        InstanceService instanceService = mock(InstanceService.class);
        bootstrap.setInstanceService(instanceService);

        DefDescriptor<? extends BaseComponentDef> appDescriptor = mock(DefDescriptor.class);
        ApplicationDef appDef = mock(ApplicationDef.class);
        doReturn(DefType.APPLICATION).when(appDescriptor).getDefType();
        doReturn(appDef).when(definitionService).getDefinition(appDescriptor);

        AuraContext context = mock(AuraContext.class);
        InstanceStack instanceStack = mock(InstanceStack.class);
        doReturn(appDescriptor).when(context).getApplicationDescriptor();
        doReturn(new DefaultJsonSerializationContext(true, true)).when(context).getJsonSerializationContext();
        doReturn(instanceStack).when(context).getInstanceStack();

        bootstrap.write(request, response, context);

        verify(servletUtilAdapter, times(1)).send404(Matchers.any(), Matchers.eq(request), Matchers.eq(response));
        verifyZeroInteractions(bootstrapUtil, expressionBuilder);
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
        final DefDescriptor<ApplicationDef> appDefDesc = mock(DefDescriptor.class);
        final ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        final HttpServletResponse response = mock(HttpServletResponse.class);
        final ApplicationDef appDef = mock(ApplicationDef.class);
        final DefinitionService definitionService = mock(DefinitionService.class);
        final InstanceService instanceService = mock(InstanceService.class);
        final ContextService contextService = mock(ContextService.class);

        final Bootstrap bootstrap = new Bootstrap(bootstrapUtil, expressionBuilder);
        bootstrap.setServletUtilAdapter(servletUtilAdapter);
        bootstrap.setDefinitionService(definitionService);
        bootstrap.setInstanceService(instanceService);
        bootstrap.setContextService(contextService);

        doReturn(mock(AuraContext.class)).when(contextService).getCurrentContext();
        
        doReturn(DefType.APPLICATION).when(appDefDesc).getDefType();
        doReturn(appDef).when(definitionService).getDefinition(appDefDesc);

        // Public cache expiration not set, should be no cache
        if (shouldCache) {
            doReturn("{!c.getBootstrapCacheExpiration}").when(appDef).getBootstrapPublicCacheExpiration();
            doReturn(mock(ActionDef.class)).when(appDef).getServerActionByName(Matchers.anyString());
            
            final Action action = mock(Action.class);
            doReturn(expirationSetting).when(action).getReturnValue();
            doReturn(action).when(instanceService).getInstance(Matchers.any(ActionDef.class));
            
            final PropertyReference propertyReference = mock(PropertyReference.class);
            doReturn(AuraValueProviderType.CONTROLLER.getPrefix()).when(propertyReference).getRoot();
            doReturn(propertyReference).when(propertyReference).getStem();
            doReturn("c.getBootstrapCacheExpiration").when(propertyReference).toString();
            doReturn(propertyReference).when(expressionBuilder).buildExpression(Matchers.anyString(), Matchers.any(Location.class));
        }
        bootstrap.setCacheHeaders(response, appDefDesc);

        if (shouldCache) {
            verify(expressionBuilder).buildExpression(Matchers.eq("c.getBootstrapCacheExpiration"), Matchers.isNull(Location.class));
            verify(servletUtilAdapter).setCacheTimeout(Matchers.same(response), Matchers.eq(expirationSetting.longValue() * 1000), Matchers.eq(false));
        } else {
            verify(servletUtilAdapter).setNoCache(Matchers.any(HttpServletResponse.class));
        }
        verifyNoMoreInteractions(expressionBuilder, servletUtilAdapter);
        verifyZeroInteractions(bootstrapUtil);
    }
}
