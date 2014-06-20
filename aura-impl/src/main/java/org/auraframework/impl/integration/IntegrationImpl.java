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
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.instance.Action;
import org.auraframework.integration.Integration;
import org.auraframework.integration.IntegrationServiceObserver;
import org.auraframework.integration.UnsupportedUserAgentException;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.system.Client.Type;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class IntegrationImpl implements Integration {
    public IntegrationImpl(String contextPath, Mode mode, boolean initializeAura, String userAgent, String application, IntegrationServiceObserver observer) throws QuickFixException {
        this.client = userAgent != null ? new Client(userAgent) : null;
        this.contextPath = contextPath;
        this.mode = mode;
        this.initializeAura = initializeAura;
        this.application = application != null ? application : DEFAULT_APPLICATION;
        this.observer = observer;
    }

    @Override
    public void injectComponent(String tag, Map<String, Object> attributes, String localId, String locatorDomId,
            Appendable out) throws UnsupportedUserAgentException, IOException,
            QuickFixException {

        if (!isSupportedClient(client)) {
            throw new UnsupportedUserAgentException(client.getUserAgent());
        }

        if (initializeAura && !hasApplicationBeenWritten) {
            hasApplicationBeenWritten = true;
            writeApplication(out);
        }

        AuraContext context = getContext("is");
        try {
            DefinitionService definitionService = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> descriptor = definitionService.getDefDescriptor(tag,
                    ComponentDef.class);
            ControllerDef componentControllerDef = definitionService.getDefDescriptor("aura://ComponentController",
                    ControllerDef.class).getDef();

            Map<String, Object> paramValues = Maps.newHashMap();
            paramValues.put("name", descriptor.getQualifiedName());

            Map<String, Object> actionAttributes = Maps.newHashMap();
            Map<String, String> actionEventHandlers = Maps.newHashMap();

            ComponentDef componentDef = descriptor.getDef();
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
                        throw new AuraRuntimeException(
                                String.format("Unknown attribute or event %s - %s", tag, key));
                    }
                }
            }

            paramValues.put("attributes", actionAttributes);

            Action action = componentControllerDef.createAction("getComponent", paramValues);
            action.setId("ais");

            Action previous = context.setCurrentAction(action);
            try {
                action.run();
            } finally {
                context.setCurrentAction(previous);
            }

            Message message = new Message(Lists.newArrayList(action));

            try {
                StringBuilder init = new StringBuilder();

                init.append("var config = ");
                Aura.getSerializationService().write(message, null, Message.class, init);
                init.append(";\n");

                if (!actionEventHandlers.isEmpty()) {
                    init.append("config.actionEventHandlers = ");
                    Json.serialize(actionEventHandlers, init);
                    init.append(";\n");
                }

                init.append(String.format("$A.run(function() { $A.clientService.injectComponent(config, \"%s\", \"%s\"); });\n", locatorDomId, localId));

                out.append("<script>").append(init).append("</script>");

            } catch (Throwable t) {
                // DCHASMAN TODO W-1498425 Refine this approach - we currently have 2 conflicting exception handling mechanisms kicking in that need to be
                // reconciled
                out.append("<script>").append("$A.log('failed to create component: " + t.toString() + "')")
                        .append("</script>");
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
        
        if (application != DEFAULT_APPLICATION) {
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
        
        if (observer != null) {
            observer.contextEstablished(this, context);
        }

        return context;
    }

    private void writeApplication(Appendable out) throws IOException, AuraRuntimeException, QuickFixException {
        if (isSupportedClient(client)) {
            // ensure that we have a context.
            getContext(null);
            try {
                ApplicationDef appDef = getApplicationDescriptor(application).getDef();

                Aura.getSerializationService().write(appDef, null,
                        appDef.getDescriptor().getDefType().getPrimaryInterface(), out, "EMBEDDED_HTML");
            } catch (QuickFixException e) {
                throw new AuraRuntimeException(e);
            } finally {
                releaseContext();
            }
        }
    }

    private static boolean isSupportedClient(Client client) {
        return client == null || (client.getType() != Type.IE6 && client.getType() != Type.OTHER);
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
    private final IntegrationServiceObserver observer;

    private boolean hasApplicationBeenWritten;
    private int contextDepthCount = 0;
}
