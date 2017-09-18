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
package org.auraframework.impl;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.http.BrowserCompatibilityService;
import org.auraframework.impl.integration.IntegrationImpl;
import org.auraframework.integration.Integration;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.IntegrationService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;

@ServiceComponent
public class IntegrationServiceImpl implements IntegrationService {
    private static final long serialVersionUID = -2650728458106333787L;

    // Needed to run action
    private InstanceService instanceService;
    private DefinitionService definitionService;
    private ContextService contextService;
    private RenderingService renderingService;
    private ConfigAdapter configAdapter;
    private ServletUtilAdapter servletUtilAdapter;
    private ClientLibraryService clientLibraryService;
    private BrowserCompatibilityService browserCompatibilityService;
 
    @Override
    public Integration createIntegration(String contextPath, Mode mode, boolean initializeAura, String userAgent,
                                         String application, Object dummy) throws QuickFixException {
        return new IntegrationImpl(contextPath, mode, initializeAura, userAgent, application, instanceService,
                definitionService, contextService, configAdapter,
                renderingService, servletUtilAdapter, clientLibraryService, browserCompatibilityService);
    }

    @Inject
    public void setInstanceService(InstanceService instanceService) {
        this.instanceService = instanceService;
    }

    @Inject
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }

    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

    @Inject
    public void setRenderingService(RenderingService renderingService) {
        this.renderingService = renderingService;
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }

    @Inject
    public void setServletUtilAdapter(ServletUtilAdapter servletUtilAdapter) {
        this.servletUtilAdapter = servletUtilAdapter;
    }

    @Inject
    public void setClientLibraryService(ClientLibraryService clientLibraryService) {
        this.clientLibraryService = clientLibraryService;
    }

    @Inject
    public void setBrowserCompatibilityService(BrowserCompatibilityService browserCompatibilityService) {
        this.browserCompatibilityService = browserCompatibilityService;
    }
}
