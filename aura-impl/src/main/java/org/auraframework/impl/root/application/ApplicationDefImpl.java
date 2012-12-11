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
package org.auraframework.impl.root.application;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.builder.ApplicationDefBuilder;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.LayoutsDef;
import org.auraframework.def.SecurityProviderDef;
import org.auraframework.impl.root.component.BaseComponentDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * The definition of an Application. Holds all information about a given type of application. ApplicationDefs are immutable
 * singletons per type of Application. Once they are created, they can only be replaced, never changed.
 */
public class ApplicationDefImpl extends BaseComponentDefImpl<ApplicationDef> implements ApplicationDef {

    private static final long serialVersionUID = 9044177107921912717L;

    public static final DefDescriptor<ApplicationDef> PROTOTYPE_APPLICATION = DefDescriptorImpl.getInstance("markup://aura:application", ApplicationDef.class);
    private static final Pattern namespacePattern = Pattern.compile("^\\w*$");

    private final DefDescriptor<EventDef> locationChangeEventDescriptor;
    private final Set<String> preloads;
    private final DefDescriptor<LayoutsDef> layoutsDefDescriptor;
    private final Access access;
    private final DefDescriptor<SecurityProviderDef> securityProviderDescriptor;

    private Boolean isAppcacheEnabled;
    private Boolean isOnePageApp;

    protected ApplicationDefImpl(Builder builder) {
        super(builder);

        this.locationChangeEventDescriptor = builder.locationChangeEventDescriptor;

        this.layoutsDefDescriptor = builder.layoutsDefDescriptor;
        this.preloads = AuraUtil.immutableSet(builder.preloads);
        String accessName = builder.access;
        if(accessName == null){
            this.access = Access.AUTHENTICATED;
        }else{
            this.access = Access.valueOf(accessName.toUpperCase());
        }
        this.securityProviderDescriptor = builder.securityProviderDescriptor;
        this.isAppcacheEnabled = builder.isAppcacheEnabled;
        this.isOnePageApp = builder.isOnePageApp;
    }

    public static class Builder extends BaseComponentDefImpl.Builder<ApplicationDef> implements ApplicationDefBuilder {

        public DefDescriptor<EventDef> locationChangeEventDescriptor;
        public DefDescriptor<LayoutsDef> layoutsDefDescriptor;
        public Set<String> preloads;
        public String access;
        public Boolean isAppcacheEnabled;
        public Boolean isOnePageApp;
        public DefDescriptor<SecurityProviderDef> securityProviderDescriptor;


        public Builder() {
            super(ApplicationDef.class);
        }

        @Override
        public ApplicationDefImpl build() {
            return new ApplicationDefImpl(this);
        }

        @Override
        public Builder addPreload(String preload) {
            if(preloads == null){
                preloads = Sets.newHashSet();
            }
            preloads.add(preload);
            return this;
        }

        @Override
        public Builder setAccess(String access) {
            this.access = access;
            return this;
        }

        @Override
        public Builder setLayouts(LayoutsDef layouts) {
            layoutsDefDescriptor = layouts.getDescriptor();
            return this;
        }

        @Override
        public ApplicationDefBuilder setSecurityProviderDescriptor(String securityProviderDescriptor) {
            if(securityProviderDescriptor != null){
                this.securityProviderDescriptor = Aura.getDefinitionService().getDefDescriptor(securityProviderDescriptor, SecurityProviderDef.class);
            }else{
                this.securityProviderDescriptor = null;
            }
            return this;
        }
    }

    @Override
    protected DefDescriptor<ApplicationDef> getDefaultExtendsDescriptor() {
        return ApplicationDefImpl.PROTOTYPE_APPLICATION;
    }

    /**
     * @return Returns the locationChangeEventDescriptor.
     * @throws QuickFixException
     */
    @Override
    public DefDescriptor<EventDef> getLocationChangeEventDescriptor() throws QuickFixException {
        if(locationChangeEventDescriptor == null){
            ApplicationDef
            superDef = getSuperDef();
            if(superDef != null){
                return superDef.getLocationChangeEventDescriptor();
            }
            return null;
        }else{
            return locationChangeEventDescriptor;
        }
    }

    @Override
    public DefDescriptor<LayoutsDef> getLayoutsDefDescriptor() {
        return layoutsDefDescriptor;
    }

    @Override
    protected void serializeFields(Json json) throws IOException, QuickFixException {

        DefDescriptor<EventDef> locationChangeEventDescriptor = getLocationChangeEventDescriptor();
        if(locationChangeEventDescriptor != null){
            json.writeMapEntry("locationChangeEventDef", locationChangeEventDescriptor.getDef());
        }

        if(layoutsDefDescriptor != null){
            json.writeMapEntry("layouts", getLayoutsDefDescriptor().getDef());
        }
    }

    @Override
    public Set<String> getPreloads() {
        return preloads;
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        super.retrieveLabels();


        if(layoutsDefDescriptor != null){
            LayoutsDef layouts = layoutsDefDescriptor.getDef();
            layouts.retrieveLabels();
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        super.appendDependencies(dependencies);


        if(layoutsDefDescriptor != null){
            dependencies.add(layoutsDefDescriptor);
        }
    }

    @Override
    public Access getAccess() {
        return access;
    }

    @Override
    public Boolean isAppcacheEnabled() throws QuickFixException{
        // Don't use appcache if preloads are not set
        if(this.getPreloads() == null || this.getPreloads().isEmpty()){
            return false;
        }
        if(this.isAppcacheEnabled == null){
            return getSuperDef().isAppcacheEnabled();
        }
        return this.isAppcacheEnabled;
    }

    @Override
    public Boolean isOnePageApp() throws QuickFixException{
        return this.isOnePageApp;
    }    
    
    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();

        //MasterDefRegistry reg = Aura.getContextService().getCurrentContext().getDefRegistry();
        EventDef locationChangeDef = getLocationChangeEventDescriptor().getDef();
        if (!locationChangeDef.isInstanceOf(Aura.getDefinitionService().getDefDescriptor("aura:locationChange", EventDef.class))) {
            throw new InvalidDefinitionException(String.format("%s must extend aura:locationChange", locationChangeDef.getDescriptor()), getLocation());
        }

        for(String preload : getPreloads()){
            if(!isValidNamespace(preload)){
                throw new InvalidDefinitionException(String.format("%s is not a valid namespace", preload), getLocation());
            }

            /*if(!reg.namespaceExists(preload)){
            }*/
        }

        DefDescriptor<SecurityProviderDef> securityProviderDesc = getSecurityProviderDefDescriptor();
        if(securityProviderDesc == null){
            throw new InvalidDefinitionException(String.format("Security provider is required on application %s", getName()), getLocation());
        }
        //Will throw quickfix exception if not found.
        securityProviderDesc.getDef();
    }

    private static boolean isValidNamespace(String ns){
        return namespacePattern.matcher(ns).find();
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        ret.addAll(super.getBundle());
        if(layoutsDefDescriptor != null){
            ret.add(layoutsDefDescriptor);
        }
        return ret;
    }

    @Override
    public DefDescriptor<SecurityProviderDef> getSecurityProviderDefDescriptor() throws QuickFixException{
        if(securityProviderDescriptor == null && getExtendsDescriptor() != null){
            //going to the mdr to avoid security check, since this is used during security checks and would cause spin
            return Aura.getContextService().getCurrentContext().getDefRegistry().getDef(getExtendsDescriptor()).getSecurityProviderDefDescriptor();
        }
        return securityProviderDescriptor;
    }


}
