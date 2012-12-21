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
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.Action;
import org.auraframework.integration.Integration;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class IntegrationImpl implements Integration {
	public IntegrationImpl(String securityProviderDescr, String contextPath, Mode mode) {
		this.securityProviderDescr = securityProviderDescr;
		this.contextPath = contextPath;
		this.mode = mode;
	}

	@Override
	public void addPreload(String namespace) {
		
		// DCHASMAN TODO Figure out how to collect up all of the preloads and handle them as a set
		
		preloads.add(namespace);
	}

	@Override
	public 	void injectComponent(String tag, Map<String, Object> attributes, String localId, String locatorDomId, Appendable out) throws QuickFixException, IOException {
        DefDescriptor<ComponentDef> descriptor = Aura.getDefinitionService().getDefDescriptor(tag, ComponentDef.class);
        
        if (!hasApplicationBeenWritten) {
            hasApplicationBeenWritten = true;
            
            writeApplication(out);
        }
        
        AuraContext context = startContext("is");
        try {
            DefinitionService definitionService = Aura.getDefinitionService();
            ControllerDef componentControllerDef = definitionService.getDefDescriptor("aura://ComponentController", ControllerDef.class).getDef();
            
            Map<String, Object> paramValues = Maps.newHashMap();
            paramValues.put("name", descriptor.getQualifiedName());
            
            Map<String, Object> actionAttributes = Maps.newHashMap();
            
            ComponentDef componentDef = descriptor.getDef();
            for (Map.Entry<String, Object> entry : attributes.entrySet()) {
            	String name = componentDef.getAttributeDef(entry.getKey()).getName();
                actionAttributes.put(name, entry.getValue());
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
            
            Message<?> message = new Message<ComponentDef>(Lists.newArrayList(action), null, null);
            
            StringBuilder init = new StringBuilder();
            
            init.append("var config = ");
            Aura.getSerializationService().write(message, null, Message.class, init);
            init.append(";\n");
            
            init.append(String.format("$A.getRoot().get(\"e.addComponent\").setParams({ config: config, placeholderId: \"%s\", localId: \"%s\" }).fire();\n", locatorDomId, localId));
            
            out.append("<script>").append(init).append("</script>");

        } catch (QuickFixException x) {
            throw new AuraRuntimeException(x);
        } finally {
            Aura.getContextService().endContext();
        }
	}
	
	private AuraContext startContext(String num) {
        ContextService contextService = Aura.getContextService();
        
        AuraContext context = contextService.startContext(mode, Format.JSON, Access.AUTHENTICATED);
        context.setApplicationDescriptor(getApplicationDescriptor(securityProviderDescr));

        if (num != null) {
            context.setNum(num);
        }

        for (String preload : preloads) {
            context.addPreload(preload);
        }                    
        
        return context;
    }
	
    private void writeApplication(Appendable out) throws IOException {
        AuraContext context = startContext(null);
        try {
            context.setContextPath(contextPath);
            
            ApplicationDef appDef = getApplicationDescriptor(securityProviderDescr).getDef();
            Aura.getSerializationService().write(appDef, null, appDef.getDescriptor().getDefType().getPrimaryInterface(), out, "EMBEDDED_HTML");
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        } finally {
            Aura.getContextService().endContext();
        }
    }
    
    private static DefDescriptor<ApplicationDef> getApplicationDescriptor(String securityProviderDescr) {
    	// DCHASMAN Dynamically construct an extension of aura:integrationServiceApp that uses securityProviderDescr
        DefinitionService definitionService = Aura.getDefinitionService();
        return definitionService.getDefDescriptor("aura:integrationServiceApp", ApplicationDef.class);
    }


	private final String contextPath;
	private final Mode mode;
	private final String securityProviderDescr;
    private final Set<String> preloads = Sets.newHashSet();
    private boolean hasApplicationBeenWritten;
}
