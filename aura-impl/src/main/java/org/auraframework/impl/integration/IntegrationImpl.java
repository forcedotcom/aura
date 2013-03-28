/*
 * Copyright (C) 2012 salesforce.com, inc.
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
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.instance.Action;
import org.auraframework.integration.Integration;
import org.auraframework.integration.UnsupportedUserAgentException;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
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
import com.google.common.collect.Sets;

public class IntegrationImpl implements Integration {
    public IntegrationImpl(String contextPath, Mode mode, boolean initializeAura, String userAgent) {
        this.client = userAgent != null ? new Client(userAgent) : null;
        this.contextPath = contextPath;
        this.mode = mode;
        this.initializeAura = initializeAura;
    }

    @Override
    public void injectComponent(String tag, Map<String, Object> attributes, String localId, String locatorDomId,
            Appendable out) throws UnsupportedUserAgentException, IOException,
            QuickFixException {

        if (!isSupportedClient(client)) {
            throw new UnsupportedUserAgentException(client.getUserAgent());
        }

        if (Aura.getContextService().isEstablished()) {
            throw new AuraRuntimeException(
                    "Integration.injectComponent() cannot be called with an established Aura context!");
        }

        if (initializeAura && !hasApplicationBeenWritten) {
            hasApplicationBeenWritten = true;
            writeApplication(out);
        }

        AuraContext context = startContext("is");
        try {
            DefDescriptor<ComponentDef> descriptor = Aura.getDefinitionService().getDefDescriptor(tag,
                    ComponentDef.class);
            DefinitionService definitionService = Aura.getDefinitionService();
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

            Message<?> message = new Message<ComponentDef>(Lists.newArrayList(action));

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

                init.append(String
                        .format(
                                "$A.getRoot().get(\"e.addComponent\").setParams({ config: config, locatorDomId: \"%s\", localId: \"%s\" }).fire();\n",
                                locatorDomId,
                                localId));

                out.append("<script>");

                // To avoid "HTML Parsing Error: Unable to modify the parent container element before the child element is closed" exceptions in IE7/8
                Type clientType = context.getClient().getType();
                if (clientType == Type.IE7 || clientType == Type.IE8) {
                    StringBuilder onload = new StringBuilder("$A.util.on(window, 'load', function() {\n");
                    onload.append(init);
                    onload.append("\n});");

                    init = onload;
                }

                out.append(init).append("</script>");

            } catch (Throwable t) {
                // DCHASMAN TODO W-1498425 Refine this approach - we currently have 2 conflicting exception handling mechanisms kicking in that need to be
                // reconciled
                out.append("<script>").append("$A.log('failed to create component: " + t.toString() + "')")
                        .append("</script>");
            }
        } finally {
            Aura.getContextService().endContext();
        }
    }

    @Override
    @Deprecated
    public void addPreload(String namespace) {
        if (namespace != null && !namespace.isEmpty()) {
            preloads.add(namespace);
        }
    }

    private AuraContext startContext(String num) throws ClientOutOfSyncException, QuickFixException {
        ContextService contextService = Aura.getContextService();

        AuraContext context = contextService.startContext(mode, Format.JSON, Access.AUTHENTICATED);
        DefDescriptor<ApplicationDef> applicationDescriptor = getApplicationDescriptor();
        context.setApplicationDescriptor(applicationDescriptor);
        context.setContextPath(contextPath);
        context.setFrameworkUID(Aura.getConfigAdapter().getAuraFrameworkNonce());

        if (num != null) {
            context.setNum(num);
        }

        if (client != null) {
            context.setClient(client);
        }

        // Always include ui: because we need ui:message etc for error handling
        context.addPreload("ui");

        for (String preload : preloads) {
            context.addPreload(preload);
        }

        return context;
    }

    private void writeApplication(Appendable out) throws IOException, AuraRuntimeException, QuickFixException {
        if (isSupportedClient(client)) {
            AuraContext context = startContext(null);
            try {
                ApplicationDef appDef = getApplicationDescriptor().getDef();

                DefDescriptor<ApplicationDef> descriptor = appDef.getDescriptor();
                context.addLoaded(descriptor, context.getDefRegistry().getUid(null, descriptor));

                Aura.getSerializationService().write(appDef, null,
                        descriptor.getDefType().getPrimaryInterface(), out, "EMBEDDED_HTML");
            } catch (QuickFixException e) {
                throw new AuraRuntimeException(e);
            } finally {
                Aura.getContextService().endContext();
            }
        }
    }

    private static boolean isSupportedClient(Client client) {
        return client == null || client.getType() != Type.IE6;
    }

    private static DefDescriptor<ApplicationDef> getApplicationDescriptor() {
        DefinitionService definitionService = Aura.getDefinitionService();
        return definitionService.getDefDescriptor("aura:integrationServiceApp", ApplicationDef.class);
    }

    private final String contextPath;
    private final Mode mode;
    private final boolean initializeAura;
    private final Client client;
    private final Set<String> preloads = Sets.newHashSet();
    private boolean hasApplicationBeenWritten;
}