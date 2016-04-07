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

import java.io.IOException;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.StyleDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.impl.system.RenderContextHTMLImpl;
import org.auraframework.impl.util.TemplateUtil;
import org.auraframework.instance.Action;
import org.auraframework.instance.Application;
import org.auraframework.instance.Component;
import org.auraframework.integration.Integration;
import org.auraframework.integration.UnsupportedUserAgentException;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.system.Message;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.JsonEncoder;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class IntegrationImpl implements Integration {

    private static final String COMPONENT_DEF_TEMPLATE =
        "{'componentDef': 'markup://%s', 'attributes': { 'values' : %s }, 'localId': '%s'}";

    private TemplateUtil templateUtil = new TemplateUtil();

    public IntegrationImpl(String contextPath, Mode mode, boolean initializeAura, String userAgent,
                           String application) throws QuickFixException {
        this.client = userAgent != null ? new Client(userAgent) : null;
        this.contextPath = contextPath;
        this.mode = mode;
        this.initializeAura = initializeAura;
        this.application = application != null ? application : DEFAULT_APPLICATION;
    }

    @Override
    public void injectComponentHtml(String tag, Map<String, Object> attributes, String localId, String locatorDomId,
            Appendable out, boolean useAsync) throws UnsupportedUserAgentException, IOException, QuickFixException {
        this.injectComponent(tag, attributes, localId, locatorDomId, new RenderContextHTMLImpl(out), useAsync);
    }

    @Override
    public void injectComponentHtml(String tag, Map<String, Object> attributes, String localId, String locatorDomId,
            Appendable out) throws UnsupportedUserAgentException, IOException, QuickFixException {
        this.injectComponentHtml(tag, attributes, localId, locatorDomId, out, false);
    }

    @Override
    public void injectComponent(String tag, Map<String, Object> attributes, String localId, String locatorDomId,
            RenderContext rc) throws UnsupportedUserAgentException, IOException, QuickFixException {
        this.injectComponent(tag, attributes, localId, locatorDomId, rc, false);
    }

    @Override
    public void injectComponent(String tag, Map<String, Object> attributes, String localId, String locatorDomId,
                                RenderContext rc, boolean useAsync)
            throws UnsupportedUserAgentException, IOException, QuickFixException {

        if (initializeAura && !hasApplicationBeenWritten) {
            // load aura resources
            // specifies async so component configs are not printed to HTML
            writeApplication(rc);
            hasApplicationBeenWritten = true;
        }

        AuraContext context = getContext("is");

        try {
            DefinitionService definitionService = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> descriptor = definitionService.getDefDescriptor(tag,
                    ComponentDef.class);

            Map<String, Object> actionAttributes = Maps.newHashMap();
            Map<String, String> actionEventHandlers = Maps.newHashMap();

            ComponentDef componentDef = descriptor.getDef();
            if(attributes!=null) {
                for (Map.Entry<String, Object> entry : attributes.entrySet()) {
                    String key = entry.getKey();

                    AttributeDef attributeDef = componentDef.getAttributeDef(key);
                    if (attributeDef != null) {
                        String name = attributeDef.getName();
                        actionAttributes.put(name, entry.getValue());
                    } else {
                        RegisterEventDef eventDef = componentDef.getRegisterEventDefs().get(key);
                        if (eventDef != null) {
                            // Emit component.addHandler() wired to special global scope value provider
                            String name = eventDef.getAttributeName();
                            actionEventHandlers.put(name, (String) entry.getValue());
                        } else {
                            throw new AuraRuntimeException(String.format("Unknown attribute or event %s - %s", tag, key));
                        }
                    }
                }
            }

            try {

                StringBuilder jsonEventHandlers = null;
                if (!actionEventHandlers.isEmpty()) {
                    // serialize registered event handlers into js object
                    jsonEventHandlers = new StringBuilder();
                    JsonEncoder.serialize(actionEventHandlers, jsonEventHandlers);
                }

                StringBuilder init = new StringBuilder();

                if (useAsync) {
                    // uses newComponentAsync to create component
                    StringBuilder jsonAttributes = new StringBuilder();
                    JsonEncoder.serialize(actionAttributes, jsonAttributes);

                    // set event handlers to either js "undefined" or object of event and handler names
                    String eventHandlers = jsonEventHandlers != null ? jsonEventHandlers.toString() : "undefined";
                    String def = String.format(COMPONENT_DEF_TEMPLATE, tag, jsonAttributes.toString(), localId);
                    
                    String newComponentScript = String.format("$A.__aisScopedCallback(function() { $A.clientService.injectComponentAsync(%s, '%s', %s); });", def, locatorDomId, eventHandlers);

                    init.append(newComponentScript);

                } else {
                    // config printed onto HTML page

                    // mark injectee component as loaded
                    // only when not using async because component defs will be printed onto HTML
                    definitionService.updateLoaded(descriptor);

                    ControllerDef componentControllerDef = definitionService.getDefDescriptor("aura://ComponentController",
                            ControllerDef.class).getDef();

                    Map<String, Object> paramValues = Maps.newHashMap();
                    paramValues.put("name", descriptor.getQualifiedName());
                    paramValues.put("attributes", actionAttributes);

                    Action action = componentControllerDef.createAction("getComponent", paramValues);
                    action.setId("ais");

                    //
                    // Now build a second action.... to load all of the relevant labels.
                    //
                    Action labelAction = componentControllerDef.createAction("loadLabels", null);
                    labelAction.setId("aisLabels");

                    Action previous = context.setCurrentAction(action);
                    try {
                        action.run();
                        context.setCurrentAction(labelAction);
                        labelAction.run();
                    } finally {
                        context.setCurrentAction(previous);
                    }

                    Message message = new Message(Lists.newArrayList(action));

                    init.append("var config = ");
                    Aura.getSerializationService().write(message, null, Message.class, init);
                    init.append(";\n");

                    if (!actionEventHandlers.isEmpty()) {
                        init.append("config.actionEventHandlers = ");
                        init.append(jsonEventHandlers);
                        init.append(";\n");
                    }

                    init.append(String.format("$A.__aisScopedCallback(function() { $A.clientService.injectComponent(config, \"%s\", \"%s\"); });", locatorDomId, localId));
                }

                rc.pushScript();
                rc.getCurrent().append(init);
                rc.popScript();

            } catch (Throwable t) {
                // DCHASMAN TODO W-1498425 Refine this approach - we currently have 2 conflicting exception handling mechanisms kicking in that need to be
                // reconciled
                rc.pushScript();
                rc.getCurrent().append("$A.log(\"failed to create component: " + t.toString() + "\")");
                rc.popScript();
            }
        } finally {
            releaseContext();
        }
    }

    private void releaseContext() {
        if (contextDepthCount == 0) {
            Aura.getContextService().endContext();
        } else {
            contextDepthCount -= 1;
        }
    }

    private AuraContext getContext(String num) throws ClientOutOfSyncException, QuickFixException {
        ContextService contextService = Aura.getContextService();

        if (contextService.isEstablished()) {
            contextDepthCount += 1;
        }

        DefDescriptor<ApplicationDef> applicationDescriptor = getApplicationDescriptor(application);

        AuraContext context;
        if (contextDepthCount == 0) {
            context = contextService.startContext(mode, Format.JSON, Authentication.AUTHENTICATED, applicationDescriptor);
        } else {
            context = contextService.getCurrentContext();
        }

        String cuid = context.getLoaded().get(applicationDescriptor);
        String uid = context.getDefRegistry().getUid(cuid, applicationDescriptor);
        context.addLoaded(applicationDescriptor, uid);
        context.setPreloadedDefinitions(context.getDefRegistry().getDependencies(uid));

        if (!DEFAULT_APPLICATION.equals(application)) {
            // Check to insure that the app extends aura:integrationServiceApp
            ApplicationDef def = applicationDescriptor.getDef();
            if (!def.isInstanceOf(getApplicationDescriptor(DEFAULT_APPLICATION))) {
                throw new AuraRuntimeException("Application must extend aura:integrationServiceApp.");
            }
        }
        context.setContextPath(contextPath);
        context.setFrameworkUID(Aura.getConfigAdapter().getAuraFrameworkNonce());

        if (num != null) {
            context.setNum(num);
        }

        if (client != null) {
            context.setClient(client);
        }

        return context;
    }

    private void writeApplication(RenderContext rc) throws IOException, AuraRuntimeException, QuickFixException {
        // ensure that we have a context.
        AuraContext context = getContext(null);
        try {
            ApplicationDef appDef = getApplicationDescriptor(application).getDef();

            InstanceService instanceService = Aura.getInstanceService();
            RenderingService renderingService = Aura.getRenderingService();
            ServletUtilAdapter servletUtilAdapter = Aura.getServletUtilAdapter();
            ComponentDef templateDef = appDef.getTemplateDef();

            Map<String, Object> attributes = Maps.newHashMap();

            StringBuilder sb = new StringBuilder();
            templateUtil.writeHtmlStyles(servletUtilAdapter.getStyles(context), sb);
            attributes.put("auraStyleTags", sb.toString());
            sb.setLength(0);
            templateUtil.writeHtmlScripts(servletUtilAdapter.getScripts(context, false, null), sb);
            DefDescriptor<StyleDef> styleDefDesc = templateDef.getStyleDescriptor();
            if (styleDefDesc != null) {
                attributes.put("auraInlineStyle", styleDefDesc.getDef().getCode());
            }

            attributes.put("auraScriptTags", sb.toString());
            Map<String, Object> auraInit = Maps.newHashMap();

            Application instance = instanceService.getInstance(appDef, null);

            auraInit.put("instance", instance);
            auraInit.put("token", AuraBaseServlet.getToken());
            auraInit.put("host", context.getContextPath());

            StringBuilder contextWriter = new StringBuilder();

            Aura.getSerializationService().write(context, null, AuraContext.class, contextWriter, "JSON");

            auraInit.put("context", new Literal(contextWriter.toString()));

            attributes.put("auraInit", JsonEncoder.serialize(auraInit, context.getJsonSerializationContext()));
            Component template = instanceService.getInstance(templateDef.getDescriptor(), attributes);
            renderingService.render(template, rc);
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        } finally {
            releaseContext();
        }
    }

    private DefDescriptor<ApplicationDef> getApplicationDescriptor(String application) {
        DefinitionService definitionService = Aura.getDefinitionService();
        return definitionService.getDefDescriptor(application, ApplicationDef.class);
    }

    private static final String DEFAULT_APPLICATION = "aura:integrationServiceApp";

    private final String contextPath;
    private final Mode mode;
    private final boolean initializeAura;
    private final Client client;
    private final String application;

    private boolean hasApplicationBeenWritten = false;
    private int contextDepthCount = 0;
}
