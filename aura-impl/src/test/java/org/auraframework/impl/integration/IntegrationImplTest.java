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
package org.auraframework.impl.integration;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.BrowserCompatibilityService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.RenderContext;
import org.auraframework.util.json.JsonSerializationContext;
import org.auraframework.util.json.JsonSerializer;
import org.junit.Test;

import com.google.common.collect.ImmutableMap;


public class IntegrationImplTest {

    /**
     * test to ensure that appenders are being included as part of the application body
     */
    @Test
    public void testAppendersInjected() throws Exception {
        //ASSEMBLE
        InstanceService instanceService = mock(InstanceService.class);
        DefinitionService definitionService = mock(DefinitionService.class);
        ContextService contextService = mock(ContextService.class);
        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        RenderingService renderingService = mock(RenderingService.class);
        AuraContext context = mock(AuraContext.class);
        DefDescriptor<ApplicationDef> appDescriptor = mock(ApplicationDefDescriptor.class);
        ApplicationDef applicationDef = mock(ApplicationDef.class);
        ComponentDef templateDef = mock(ComponentDef.class);
        JsonSerializationContext serializationContext = mock(JsonSerializationContext.class);
        HashMapSerializer mapSerializer = mock(HashMapSerializer.class);
        ComponentDefDescriptor componentDefDescriptor = mock(ComponentDefDescriptor.class);
        ApplicationDefDescriptor defaultAppDescriptor = mock(ApplicationDefDescriptor.class);
        ComponentDef componentDef = mock(ComponentDef.class);
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        RenderContext renderContext = mock(RenderContext.class);
        ClientLibraryService clientLibraryService = mock(ClientLibraryService.class);
        BrowserCompatibilityService browserCompatibilityService = mock(BrowserCompatibilityService.class);

        AuraContext.Mode mode = AuraContext.Mode.UTEST;
        String contextPath = "/mockPath";
        String application = "/mockApp";
        boolean initializeAura = true;
        String userAgent = "mock-agent";
        String tag = "tag";
        Map<String, Object> attributes = new HashMap<>();
        String localId = "mockLocalId";
        String locatorDomId = "mockLocatorDomId";
        boolean useAsync = true;
        String cuid = "mockcuid";
        String uid = "mockuid";
        Map<DefDescriptor<?>, String> loaded = ImmutableMap.<DefDescriptor<?>, String> of(appDescriptor, cuid);
        StringBuilder currentRenderAppendable = new StringBuilder();

        when(applicationDef.getTemplateDef()).thenReturn(templateDef);
        when(contextService.isEstablished()).thenReturn(true);
        when(definitionService.getDefDescriptor("aura:integrationServiceApp", ApplicationDef.class)).thenReturn(defaultAppDescriptor);
        when(applicationDef.isInstanceOf(defaultAppDescriptor)).thenReturn(true);
        when(contextService.getCurrentContext()).thenReturn(context);
        when(context.getLoaded()).thenReturn(loaded);
        when(context.getJsonSerializationContext()).thenReturn(serializationContext);
        when(serializationContext.getSerializer(any(HashMap.class))).thenReturn(mapSerializer);
        when(definitionService.getDefDescriptor(application, ApplicationDef.class)).thenReturn(appDescriptor);
        when(definitionService.getUid(cuid, appDescriptor)).thenReturn(uid);
        when(definitionService.getDefinition(appDescriptor)).thenReturn(applicationDef);
        when(definitionService.getDefDescriptor(tag, ComponentDef.class)).thenReturn(componentDefDescriptor);
        when(definitionService.getDefinition(componentDefDescriptor)).thenReturn(componentDef);
        when(renderContext.getCurrent()).thenReturn(currentRenderAppendable);
        when(browserCompatibilityService.isCompatible(anyString())).thenReturn(false);

        //ACT
        IntegrationImpl target = new IntegrationImpl(contextPath, mode, initializeAura, userAgent,
                            application, instanceService, definitionService,
                            contextService, configAdapter, renderingService, servletUtilAdapter,
                            clientLibraryService, browserCompatibilityService);
        target.injectComponent(tag, attributes, localId, locatorDomId, renderContext, useAsync);

        //ASSERT
        verify(servletUtilAdapter).getInlineJs(context, applicationDef);
        verify(browserCompatibilityService, atLeastOnce()).isCompatible(anyString());
    }


    interface ApplicationDefDescriptor extends DefDescriptor<ApplicationDef>{}
    @SuppressWarnings("rawtypes")
	interface HashMapSerializer extends JsonSerializer<HashMap> {}
    interface ComponentDefDescriptor extends DefDescriptor<ComponentDef>{}

}
