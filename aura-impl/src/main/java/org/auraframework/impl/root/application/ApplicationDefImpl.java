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
package org.auraframework.impl.root.application;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.ApplicationDefBuilder;
import org.auraframework.builder.BaseComponentDefBuilder;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.EventDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.Literal;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.AuraExpressionBuilder;
import org.auraframework.impl.root.component.BaseComponentDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.instance.Action;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Splitter;
import com.google.common.collect.Maps;

/**
 * The definition of an Application. Holds all information about a given type of application. ApplicationDefs are
 * immutable singletons per type of Application. Once they are created, they can only be replaced, never changed.
 */
public class ApplicationDefImpl extends BaseComponentDefImpl<ApplicationDef> implements ApplicationDef {

    private static final long serialVersionUID = 9044177107921912717L;
    
    private final DefDescriptor<EventDef> locationChangeEventDescriptor;
    private final List<DefDescriptor<ComponentDef>> trackedDependencies;
    private final Boolean isAppcacheEnabled;
    private final String additionalAppCacheURLs;
    private final String bootstrapPublicCacheExpiration;
    private final List<DefDescriptor<TokensDef>> tokenOverrides;
    private final List<DefDescriptor<ModuleDef>> moduleServices;
    private FlavorsDef flavorOverrides;
    private final DefDescriptor<FlavorsDef> externalFlavorOverrides;

    public static final DefDescriptor<ApplicationDef> PROTOTYPE_APPLICATION = new DefDescriptorImpl<>(
            "markup", "aura", "application", ApplicationDef.class);

    protected ApplicationDefImpl(Builder builder) {
        super(builder);

        this.locationChangeEventDescriptor = builder.locationChangeEventDescriptor;
        this.trackedDependencies = AuraUtil.immutableList(builder.trackedDependency);
        this.isAppcacheEnabled = builder.isAppcacheEnabled;
        this.additionalAppCacheURLs = builder.additionalAppCacheURLs;
        this.bootstrapPublicCacheExpiration = builder.bootstrapPublicCacheExpiration;
        this.tokenOverrides = AuraUtil.immutableList(builder.tokenOverrides);
        this.flavorOverrides = builder.flavorOverrides;
        this.externalFlavorOverrides = builder.externalFlavorOverrides;
        this.moduleServices = builder.services;
    }

    public static class Builder extends BaseComponentDefImpl.Builder<ApplicationDef>implements ApplicationDefBuilder {
        public DefDescriptor<EventDef> locationChangeEventDescriptor;
        public List<DefDescriptor<ComponentDef>> trackedDependency;
        public Boolean isAppcacheEnabled;
        public String additionalAppCacheURLs;
        public String bootstrapPublicCacheExpiration;
        private List<DefDescriptor<TokensDef>> tokenOverrides;
        private FlavorsDef flavorOverrides;
        private DefDescriptor<FlavorsDef> externalFlavorOverrides;
        private List <DefDescriptor<ModuleDef>> services;

        public Builder() {
            super(ApplicationDef.class);
        }

        @Override
        public BaseComponentDefBuilder<ApplicationDef> setTokenOverrides(String tokenOverrides) {
            if (this.tokenOverrides == null) {
                this.tokenOverrides = new ArrayList<>();
            }
            for (String name : Splitter.on(',').trimResults().omitEmptyStrings().split(tokenOverrides)) {
                this.tokenOverrides.add(Aura.getDefinitionService().getDefDescriptor(name, TokensDef.class));
            }
            return this;
        }

        @Override
        public BaseComponentDefBuilder<ApplicationDef> setModuleServices(String services) {
            if (this.services == null) {
                this.services = new ArrayList<>();
            }
            for (String name : Splitter.on(',').trimResults().omitEmptyStrings().split(services)) {
                this.services.add(Aura.getDefinitionService().getDefDescriptor(name, ModuleDef.class));
            }
            return this;
        }

        @Override
        public BaseComponentDefBuilder<ApplicationDef> setFlavorOverrides(DefDescriptor<FlavorsDef> flavorOverrides) {
            this.externalFlavorOverrides = flavorOverrides;
            return this;
        }

        @Override
        public BaseComponentDefBuilder<ApplicationDef> setFlavorOverrides(FlavorsDef flavorOverrides) {
            this.flavorOverrides = flavorOverrides;
            return this;
        }

        
        @Override
        public ApplicationDefImpl build() {
            finish();
            return new ApplicationDefImpl(this);
        }

         @Override
        public DefDescriptor<ApplicationDef> getDefaultExtendsDescriptor() {
            return ApplicationDefImpl.PROTOTYPE_APPLICATION;
        }

        public void addTrackedDependency(DefDescriptor<ComponentDef> trackedDef) {
            if (this.trackedDependency == null) {
                 this.trackedDependency = new ArrayList<>();
            }
            this.trackedDependency.add(trackedDef);
        }
    }

    /**
     * @return Returns the locationChangeEventDescriptor.
     * @throws QuickFixException
     */
    @Override
    public DefDescriptor<EventDef> getLocationChangeEventDescriptor() throws QuickFixException {
        if (locationChangeEventDescriptor == null) {
            ApplicationDef superDef = getSuperDef();
            if (superDef != null) {
                return superDef.getLocationChangeEventDescriptor();
            }
            return null;
        } else {
            return locationChangeEventDescriptor;
        }
    }

    @Override
    public List<DefDescriptor<ComponentDef>> getTrackedDependencies() {
        return trackedDependencies;
    }
    
    @Override
    public List<DefDescriptor<TokensDef>> getTokenOverrides() throws QuickFixException{
        List<DefDescriptor<TokensDef>> tokens=new ArrayList<>();
        if(getExtendsDescriptor()!=null){
            tokens.addAll(getExtendsDescriptor().getDef().getTokenOverrides());
        }
        tokens.addAll(tokenOverrides);
        return tokens;
    }

    @Override
    public FlavorsDef getFlavorOverridesDef() throws QuickFixException {
        if (flavorOverrides != null) {
            return flavorOverrides;
        } else if (getExtendsDescriptor() != null) {
            return getExtendsDescriptor().getDef().getFlavorOverridesDef();
        }
        return null;
    }

    @Override
    @Deprecated
    public DefDescriptor<FlavorsDef> getFlavorOverrides() throws QuickFixException {
        if (externalFlavorOverrides != null) {
            return externalFlavorOverrides;
        } else if (flavorOverrides != null) {
            return flavorOverrides.getDescriptor();
        }
        if (getExtendsDescriptor() != null) {
            return getExtendsDescriptor().getDef().getFlavorOverrides();
        }
        return null;
    }
    
    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = super.getBundle();
        DefDescriptor<FlavorsDef> flavors = null;
        
        if (externalFlavorOverrides != null) {
            flavors = externalFlavorOverrides;
        } else if (flavorOverrides != null) {
            flavors = flavorOverrides.getDescriptor();
        }
        if (flavors != null) {
            ret.add(flavors);
        }
        
        return ret;
    }

    @Override
    protected void serializeFields(Json json) throws IOException, QuickFixException {
        DefDescriptor<EventDef> locationChangeEventDescriptor = getLocationChangeEventDescriptor();
        if (locationChangeEventDescriptor != null) {
            json.writeMapEntry("locationChangeEventDef", locationChangeEventDescriptor.getDef());
        }
        Map<String,String> tokens = getTokens();
        if (tokens != null && !tokens.isEmpty()) {
            json.writeMapEntry("tokens",tokens);
        }
        if (flavorOverrides != null) {
            json.writeMapEntry("flavorOverrides", flavorOverrides);
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);

        if (locationChangeEventDescriptor != null) {
            dependencies.add(locationChangeEventDescriptor);
        }        

        if (tokenOverrides != null) {
            dependencies.addAll(tokenOverrides);
        }

        if (externalFlavorOverrides != null) {
            dependencies.add(externalFlavorOverrides);
        }

        if (moduleServices != null) {
            dependencies.addAll(moduleServices);
        }
    }

    @Override
    public Boolean isAppcacheEnabled() throws QuickFixException {
        if (isAppcacheEnabled != null) {
            return isAppcacheEnabled;
        }
        if (getExtendsDescriptor() != null) {
            return Aura.getDefinitionService().getUnlinkedDefinition(getExtendsDescriptor()).isAppcacheEnabled();
        }
        return Boolean.FALSE;
    }

    @Override
    public List<String> getAdditionalAppCacheURLs() throws QuickFixException {
        List<String> urls = Collections.emptyList();

        if (additionalAppCacheURLs != null) {
            Expression expression = AuraExpressionBuilder.INSTANCE.buildExpression(
                    TextTokenizer.unwrap(additionalAppCacheURLs), null);
            if (!(expression instanceof PropertyReference)) {
                throw new AuraRuntimeException(
                        "Value of 'additionalAppCacheURLs' attribute must be a reference to a server Action");
            }

            PropertyReference ref = (PropertyReference) expression;
            ref = ref.getStem();

            ControllerDef controllerDef = getControllerDef();
            ActionDef actionDef = controllerDef.getSubDefinition(ref.toString());
            Action action = Aura.getInstanceService().getInstance(actionDef);

            AuraContext context = Aura.getContextService().getCurrentContext();
            Action previous = context.setCurrentAction(action);
            try {
                action.run();
            } finally {
                context.setCurrentAction(previous);
            }

            @SuppressWarnings("unchecked")
            List<String> additionalURLs = (List<String>) action.getReturnValue();
            if (additionalURLs != null) {
                urls = additionalURLs;
            }
        }

        return urls;
    }

    /**
     * Returns any configured public cache expiration (in seconds) for bootstrap.js, or null if not set.
     */
    @Override
    public Integer getBootstrapPublicCacheExpiration() throws QuickFixException {
        Integer expiration = null;
        
        if (bootstrapPublicCacheExpiration != null) {
            Expression expression = AuraExpressionBuilder.INSTANCE.buildExpression(
                    TextTokenizer.unwrap(bootstrapPublicCacheExpiration), null);
            
            Object value = null;
            if (expression instanceof Literal) {
                value = ((Literal) expression).getValue();
            } else if (expression instanceof PropertyReference) {
                PropertyReference ref = (PropertyReference) expression;
                if (AuraValueProviderType.CONTROLLER.getPrefix().equals(ref.getRoot())) {
                    ref = ref.getStem();

                    ControllerDef controllerDef = getControllerDef();
                    ActionDef actionDef = controllerDef.getSubDefinition(ref.toString());
                    Action action = Aura.getInstanceService().getInstance(actionDef);
        
                    AuraContext context = Aura.getContextService().getCurrentContext();
                    Action previous = context.setCurrentAction(action);
                    try {
                        action.run();
                    } finally {
                        context.setCurrentAction(previous);
                    }
                    
                    value = action.getReturnValue();
                }
            }

            int intValue;
            if (value instanceof Integer) {
                intValue = ((Integer) value).intValue();
            } else if (value instanceof Long) {
                intValue = ((Long) value).intValue();
            } else {
                throw new AuraRuntimeException(
                        "Value of 'bootstrapPublicCacheExpiration' attribute must either be an integer or a reference to a server Action");
            }
            
            expiration = intValue < 0 ? 0 : intValue;
        }
        
        return expiration;
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();

        EventDef locationChangeDef = getLocationChangeEventDescriptor().getDef();
        if (!locationChangeDef.isInstanceOf(Aura.getDefinitionService().getDefDescriptor("aura:locationChange",
                EventDef.class))) {
            throw new InvalidDefinitionException(String.format("%s must extend aura:locationChange",
                    locationChangeDef.getDescriptor()), getLocation());
        }
        if (externalFlavorOverrides != null && flavorOverrides == null) {
            flavorOverrides = externalFlavorOverrides.getDef();
        }
    }

    @Override
    public Map<String, String> getTokens(){
        Map<String,String> tokens=Maps.newHashMap();
        try {
            DefDescriptor<? extends BaseComponentDef> top = Aura.getContextService().getCurrentContext().getLoadingApplicationDescriptor();
            if (top != null && top.getDefType() == DefType.APPLICATION)  {
                List<DefDescriptor<TokensDef>> tokensDefs = ((ApplicationDef)top.getDef()).getTokenOverrides();
                for (DefDescriptor<TokensDef> descriptor : tokensDefs) {
                    addTokens(descriptor, tokens);
                }                
            }
        } catch (QuickFixException e) {
            //?? No Application Def -- Borked
        } catch (NullPointerException e){
            //?? No Context -- Borked
        }
        return tokens;
    }

    private void addTokens(DefDescriptor<TokensDef> tokenDescriptor,Map<String,String> tokens) throws QuickFixException{
        TokensDef tokensDef=tokenDescriptor.getDef();
        DefDescriptor<TokensDef> extendsDef = tokensDef.getExtendsDescriptor();
        if (extendsDef != null) {
            addTokens(extendsDef,tokens);
        }
        if(tokensDef.getSerializable()) {
            Map<String, TokenDef> tokenDefs = tokensDef.getOwnTokenDefs();
            for (Map.Entry<String, TokenDef> token : tokenDefs.entrySet()) {
                tokens.put(token.getKey(), (String) token.getValue().getValue());
            }
        }
    }

    @Override
    public List<DefDescriptor<ModuleDef>> getModuleServices() throws QuickFixException{
        return moduleServices;
    }
}
