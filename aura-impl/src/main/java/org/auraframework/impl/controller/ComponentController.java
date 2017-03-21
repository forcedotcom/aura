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
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.impl.java.controller.JavaAction;
import org.auraframework.impl.javascript.controller.JavascriptPseudoAction;
import org.auraframework.impl.util.TypeParser;
import org.auraframework.impl.util.TypeParser.Type;
import org.auraframework.instance.Action;
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
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

@ServiceComponent
public class ComponentController implements Controller {

    private InstanceService instanceService;
    private ExceptionAdapter exceptionAdapter;
    private DefinitionService definitionService;
    private ContextService contextService;
    private ConfigAdapter configAdapter;

    /**
     * A Java exception representing a <em>Javascript</em> error condition, as
     * reported from client to server for forensic logging.
     *
     * @since 194
     */
    public static class AuraClientException extends Exception {
        private static final long serialVersionUID = -5884312216684971013L;

        private final Action action;
        private final String jsStack;
        private String causeDescriptor;
        private String errorId;
        private String namespace;
        private String componentName;
        private String methodName;
        private String cmpStack;

        public AuraClientException(String desc, String id, String message, String jsStack, String cmpStack,
                                   InstanceService instanceService, ExceptionAdapter exceptionAdapter) {
            super(message);
            Action action = null;
            this.causeDescriptor = null;
            this.errorId = id;
            if (desc != null) {
                try {
                    action = instanceService.getInstance(desc, ActionDef.class);
                    if (action instanceof JavascriptPseudoAction) {
                        JavascriptPseudoAction jpa = (JavascriptPseudoAction) action;
                        jpa.addError(this);
                    } else if (action instanceof JavaAction) {
                        JavaAction ja = (JavaAction) action;
                        ja.addException(this, Action.State.ERROR, false, false, exceptionAdapter);
                    }
                } catch (Exception e) {
                    this.causeDescriptor = desc;
                }
            }

            // use cause to track failing component markup if action is not sent.
            if (this.causeDescriptor == null && desc != null && desc.contains("markup://")) {
                this.causeDescriptor = desc;
            }

            if (this.causeDescriptor != null && !this.causeDescriptor.isEmpty()) {
                // "markup://foo:bar"
                int markupIndex = this.causeDescriptor.indexOf("markup://");
                if (markupIndex > -1) {
                    String markup = this.causeDescriptor.substring(markupIndex).split(" ")[0];
                    Type t = TypeParser.parseTag(markup);
                    this.namespace = t.namespace;
                    this.componentName = t.name;
                } else {
                    // foo$bar$controller$method
                    String[] parts = this.causeDescriptor.split("[$]");
                    if (parts.length > 1) {
                        this.namespace = parts[0];
                        this.componentName = parts[1];
                        this.methodName = parts[parts.length-1];
                    }
                }
            }

            // parsing stacktrace to figure out whether the error is from external script 
            if (this.componentName == null && jsStack != null && !jsStack.isEmpty()) {
                String[] traces = jsStack.split("\n");
                for (String trace : traces) {
                    // extract filename
                    int i = trace.indexOf(".js:");
                    if (i > -1) {
                        String filepath = trace.substring(0, i);
                        String[] pathparts = filepath.split("/");
                        // we don't care about aura script file path
                        if (pathparts.length > 1 && !pathparts[pathparts.length-1].matches("aura_.+")) {
                            if (this.componentName == null) {
                                this.componentName = pathparts[pathparts.length-1];
                                this.namespace = pathparts[pathparts.length-2];
                            }
                        }
                    }
                }
            }

            this.action = action;
            this.jsStack = jsStack;
            this.cmpStack = cmpStack;
        }

        public Action getOriginalAction() {
            return action;
        }

        public String getClientStack() {
            return jsStack;
        }

        public String getComponentStack() {
            return cmpStack;
        }

        public String getCauseDescriptor() {
            return causeDescriptor;
        }

        public String getClientErrorId() {
            return errorId;
        }

        public String getFailedComponentNamespace() {
            return this.namespace;
        }

        public String getFailedComponent() {
            return this.componentName;
        }

        public String getFailedComponentMethod() {
            return this.methodName;
        }

        public String getStackTraceIdGen() {
            String[] traces = jsStack.split("\n");
            StringBuilder sb = new StringBuilder();
            for (String trace : traces) {
                // remove domain and url parts except filename
                trace = trace.replaceAll("https?://([^/]*/)+", "");
                // remove line and column number
                trace = trace.replaceAll(":[0-9]+:[0-9]+", "");
                // remove trailing part of filename
                trace = trace.replaceAll("[.]js.+$", ".js");
                sb.append(trace+'\n');
            }
            return sb.toString();
        }
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

        DefDescriptor<D> desc = definitionService.getDefDescriptor(name, defType);
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
    public void reportFailedAction(@Key(value = "failedAction") String desc, @Key("failedId") String id,
                                   @Key("clientError") String error, @Key("clientStack") String stack, @Key("componentStack") String componentStack) {
        // Error reporting (of errors in prior client-side actions) are handled specially
        AuraClientException ace = new AuraClientException(desc, id, error, stack, componentStack, instanceService, exceptionAdapter);
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
