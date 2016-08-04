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
package org.auraframework;

import java.util.List;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.adapter.StyleAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.Definition;
import org.auraframework.instance.Instance;
import org.auraframework.service.BuilderService;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.ConverterService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.IntegrationService;
import org.auraframework.service.LocalizationService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.util.adapter.SourceControlAdapter;
import org.auraframework.util.json.JsonSerializerFactory;

/**
 * Entry point for accessing Aura services
 */
@ServiceComponent
public class Aura implements AuraDeprecated {
    private static IntegrationService integrationService;
    private static StyleAdapter styleAdapter;
    private static ConfigAdapter configAdapter;
    private static LoggingService loggingService;
    private static DefinitionService definitionService;
    private static ContextService contextService;
    private static InstanceService instanceService;
    private static SourceControlAdapter sourceControlAdapter;
    private static ConverterService converterService;
    private static BuilderService builderService;
    private static LocalizationService localizationService;
    private static JsonSerializerFactory jsonSerializerFactory;
    private static List<JsonSerializerAdapter> jsonSerializerAdapters;
    private static CachingService cachingService;
    private static ExceptionAdapter exceptionAdapter;
    private static LocalizationAdapter localizationAdapter;
    private static ServerService serverService;

    @Inject
    public void setLocalizationAdapter(LocalizationAdapter adapter) {
        localizationAdapter = adapter;
    }

    @Inject
    public void setExceptionAdapter(ExceptionAdapter adapter) {
        exceptionAdapter = adapter;
    }

    @Inject
    public void setCachingService(CachingService service) {
        cachingService = service;
    }
    
    @Inject
    public void setJsonSerializerFactory(JsonSerializerFactory factory) {
        jsonSerializerFactory = factory;
    }
    
    @Inject
    public void setJsonSerializerAdapter(List<JsonSerializerAdapter> adapters) {
        jsonSerializerAdapters = adapters;
    }
    
    @Inject
    public void setContextService(ContextService service) {
        contextService = service;
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter adapter) {
        configAdapter = adapter;
    }

    @Inject
    public void setLoggingService(LoggingService service) {
        loggingService = service;
    }

    @Inject
    public void setDefinitionService(DefinitionService service) {
        definitionService = service;
    }

    @Inject
    public void setInstanceService(InstanceService service) {
        instanceService = service;
    }

    @Inject
    public void setStyleAdapter(StyleAdapter adapter) {
        styleAdapter = adapter;
    }

    @Inject
    public void setSourceControlAdapter(SourceControlAdapter adapter) {
        sourceControlAdapter = adapter;
    }

    @Inject
    public void setIntegrationService(IntegrationService service) {
        integrationService = service;
    }

    @Inject
    public void setConverterService(ConverterService service) {
        converterService = service;
    }

    @Inject
    public void setBuilderService(BuilderService service) {
        builderService = service;
    }

    @Inject
    public void setLocalizationService(LocalizationService service) {
        localizationService = service;
    }

    @Inject
    public void setServerService(ServerService service) {
        serverService = service;
    }

    /**
     * Get the Context Service: for creating or interacting with a {@link AuraContext} A AuraContext must be started
     * before working using any other service.
     */
    // Used by: Lots
    public static ContextService getContextService() {
        return contextService;
    }

    /**
     * Get the Definition Service: for loading, finding or interacting with a {@link Definition}
     */
    // Used by: Lots
    public static DefinitionService getDefinitionService() {
        return definitionService;
    }

    /**
     * Get the Logging Service: Provides Aura with a top-level Logging handler from the host environments
     */
    // Used by: ApexAuraComponent, BaseComponentImpl, SFDCAuraContextFilter, CoreLightningComponentFacadeImpl, JavaModel, ServiceComponentModel, RecordValueProvider, and more...
    public static LoggingService getLoggingService() {
        return loggingService;
    }

    /**
     * Get the Instance Service: for constructing an {@link Instance} of a {@link Definition}
     */
    // Used by: Everybody
    public static InstanceService getInstanceService() {
        return instanceService;
    }

    /**
     * Get the Config Adapter: Provides Aura with configuration from the host environment
     */
    // Used by: Everybody
    public static ConfigAdapter getConfigAdapter() {
        return configAdapter;
    }

    /**
     * Get the Source Control Adapter : Allows interaction with the source control system.
     */
    // Used by FileSource
    public static SourceControlAdapter getSourceControlAdapter() {
        return sourceControlAdapter;
    }

    /**
     * Get the Style Adapter: Used to provide CSS/Style specific functionality.
     */
    // Used by StyleContextImpl, Tokens, FlavoredStyleParser, StyleParser, ParserConfiguration, AbstractStyleDef
    public static StyleAdapter getStyleAdapter() {
        return styleAdapter;
    }

    /**
     * Gets the Integration Service: Service that makes integrating into other containers easy.
     */
    // Used in AuraElement, AuraServicesImpl (not used after that), ImportWizardAuraIntegrationServlet, and AuraIntegrationHolder
    public static IntegrationService getIntegrationService() {
        return integrationService;
    }

    // Used in BaseComponentImpl and JavaTypeDef
    public static ConverterService getConverterService() {
        return converterService;
    }

    // Used in many places in sfdc
    @Deprecated
    public static BuilderService getBuilderService() {
        return builderService;
    }

    // Used in many places in sfdc
    @Deprecated
    public static LocalizationService getLocalizationService() {
        return localizationService;
    }

    /**
     * USE INJECTION INSTEAD
     * @return
     */
    @Deprecated
    public static JsonSerializerFactory getJsonSerializerFactory() {
        return jsonSerializerFactory;
    }

    /**
     * USE INJECTION INSTEAD
     * @return
     */
    @Deprecated
    public static List<JsonSerializerAdapter> getJsonSerializerAdapters() {
        return jsonSerializerAdapters;
    }
    /**
     * USE INJECTION INSTEAD
     * @return
     */
    @Deprecated
    public static CachingService getCachingService() {
        return cachingService;
    }

    /**
     * USE INJECTION INSTEAD
     * @return
     */
    @Deprecated
    public static ExceptionAdapter getExceptionAdapter() {
        return exceptionAdapter;
    }

    /**
     * USE INJECTION INSTEAD
     * @return
     */
    @Deprecated
    public static LocalizationAdapter getLocalizationAdapter() {
        return localizationAdapter;
    }

    /**
     * USE INJECTION INSTEAD
     * @return
     */
    @Deprecated
    public static ServerService getServerService() {
        return serverService;
    }
}
