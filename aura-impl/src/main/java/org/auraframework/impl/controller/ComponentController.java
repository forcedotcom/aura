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
package org.auraframework.impl.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.ds.servicecomponent.GlobalController;
import org.auraframework.instance.Application;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.Instance;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

@ServiceComponent
public class ComponentController implements GlobalController {
    private static final String NAME = "aura://ComponentController";

    private InstanceService instanceService;
    private ExceptionAdapter exceptionAdapter;
    private DefinitionService definitionService;
    private ContextService contextService;
    private ConfigAdapter configAdapter;

    @Override
    public String getQualifiedName() {
        return NAME;
    }

    @AuraEnabled
    public Boolean loadLabels() throws QuickFixException {
        AuraContext ctx = contextService.getCurrentContext();
        Map<DefDescriptor<? extends Definition>, Definition> defMap;

        definitionService.getDefinition(ctx.getApplicationDescriptor());
        defMap = ctx.filterLocalDefs(null);
        for (Map.Entry<DefDescriptor<? extends Definition>, Definition> entry : defMap.entrySet()) {
            Definition def = entry.getValue();
            if (def != null) {
                def.retrieveLabels();
            }
        }
        return Boolean.TRUE;
    }

    public <D extends BaseComponentDef, T extends BaseComponent<D, T>>
    T getBaseComponent(Class<T> type, Class<D> defType, String name,
                       Map<String, Object> attributes, Boolean loadLabels) throws QuickFixException {

        DefDescriptor<D> desc;
        try {
            desc = definitionService.getDefDescriptor(name, defType);
        } catch (AuraRuntimeException invalid) {
            // FIXME: W-3979409 we should return an error to the client.
            throw new InvalidDefinitionException("Invalid descriptor: "+name, new Location("getComponent", 0L));
        }
        definitionService.updateLoaded(desc);
        T component = instanceService.getInstance(desc, attributes);
        if (Boolean.TRUE.equals(loadLabels)) {
            this.loadLabels();
        }
        return component;
    }

    // Not aura enabled, but called from code. This is probably bad practice.
    public Component getComponent(String name, Map<String, Object> attributes) throws QuickFixException {
        return getBaseComponent(Component.class, ComponentDef.class, name, attributes, false);
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    @AuraEnabled
    public Instance getComponent(@Key(value = "name", loggable = true) String name,
                                 @Key("attributes") Map<String, Object> attributes,
                                 @Key(value = "chainLoadLabels", loggable = true) Boolean loadLabels) throws QuickFixException {
            DefDescriptor<ModuleDef> moduleDesc = definitionService.getDefDescriptor(name, ModuleDef.class);
        if (contextService.getCurrentContext().isModulesEnabled() &&
                configAdapter.getModuleNamespaces().contains(moduleDesc.getNamespace()) && moduleDesc.exists()) {
                    definitionService.updateLoaded(moduleDesc);
                    return instanceService.getInstance(moduleDesc, attributes);
                }
        return getBaseComponent(Component.class, ComponentDef.class, name, attributes, loadLabels);
    }

    @AuraEnabled
    public Application getApplication(@Key(value = "name", loggable = true) String name,
                                      @Key("attributes") Map<String, Object> attributes,
                                      @Key(value = "chainLoadLabels", loggable = true) Boolean loadLabels) throws QuickFixException {
        return getBaseComponent(Application.class, ApplicationDef.class, name, attributes, loadLabels);
    }

    /**
     * Called when the client-side code encounters a failed client-side action, to allow server-side
     * record of the code error.
     *
     * @param desc The name of the client action failing
     * @param id The id of the client error
     * @param error The javascript error message of the failure
     * @param stack Not always available (it's browser dependent), but if present, a browser-dependent
     *      string describing the Javascript stack for the error.  Some frames may be obfuscated,
     *      anonymous, omitted after inlining, etc., but it may help diagnosis.
     * @param componentStack Not always available (it's context dependent), but if present, a
     *      string describing the component hierarchy stack for the error.
     */
    @AuraEnabled
    public void reportFailedAction(
            @Key(value = "failedAction") String desc,
            @Key("failedId") String id,
            @Key("clientError") String error,
            @Key("clientStack") String stack,
            @Key("componentStack") String componentStack,
            @Key("stacktraceIdGen") String stacktraceIdGen) {
        // Error reporting (of errors in prior client-side actions) are handled specially
        AuraClientException ace = new AuraClientException(
                                    desc,
                                    id,
                                    error,
                                    stack,
                                    componentStack,
                                    stacktraceIdGen,
                                    instanceService,
                                    exceptionAdapter,
                                    configAdapter,
                                    contextService,
                                    definitionService);
        exceptionAdapter.handleException(ace, ace.getOriginalAction());
    }

    @AuraEnabled
    public ComponentDef getComponentDef(@Key(value = "name", loggable = true) String name) throws QuickFixException {
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor(name, ComponentDef.class);
        return definitionService.getDefinition(desc);
    }

    @AuraEnabled
    public List<RootDefinition> getDefinitions(@Key(value = "names", loggable = true) List<String> names) throws QuickFixException {
        if (names == null) {
            return Collections.emptyList();
        }
        List<RootDefinition> returnDefs = Lists.newArrayListWithCapacity(names.size());
        for(String name : names) {
            if(name.contains("e.")) {
                returnDefs.add(getEventDef(name));
            } else {
                returnDefs.add(getComponentDef(name));
            }
        }
        return returnDefs;
    }

    @AuraEnabled
    public EventDef getEventDef(@Key(value = "name", loggable = true) String name) throws QuickFixException {
        final String descriptorName = name.replace("e.", "");
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor(descriptorName, EventDef.class);
        return definitionService.getDefinition(desc);
    }

    @AuraEnabled
    public ApplicationDef getApplicationDef(@Key(value = "name", loggable = true) String name) throws QuickFixException {
        DefDescriptor<ApplicationDef> desc = definitionService.getDefDescriptor(name, ApplicationDef.class);
        return definitionService.getDefinition(desc);
    }

    @SuppressWarnings("rawtypes")
    @AuraEnabled
    public List<Instance> getComponents(@Key("components") List<Map<String, Object>> components)
            throws QuickFixException {
        List<Instance> ret = Lists.newArrayList();
        for (int i = 0; i < components.size(); i++) {
            Map<String, Object> cmp = components.get(i);
            String descriptor = (String)cmp.get("descriptor");
            @SuppressWarnings("unchecked")
            Map<String, Object> attributes = (Map<String, Object>) cmp.get("attributes");
            ret.add(getComponent(descriptor, attributes, Boolean.FALSE));
        }
        return ret;
    }

    @Inject
    public void setInstanceService(InstanceService instanceService) {
        this.instanceService = instanceService;
    }

    @Inject
    public void setExceptionAdapter(ExceptionAdapter exceptionAdapter) {
        this.exceptionAdapter = exceptionAdapter;
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
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }
}
