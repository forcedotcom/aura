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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.ApplicationDefBuilder;
import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.LayoutsDef;
import org.auraframework.def.SecurityProviderDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.css.parser.ThemeOverrideMapImpl;
import org.auraframework.impl.root.component.BaseComponentDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.instance.Action;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * The definition of an Application. Holds all information about a given type of application. ApplicationDefs are
 * immutable singletons per type of Application. Once they are created, they can only be replaced, never changed.
 */
public class ApplicationDefImpl extends BaseComponentDefImpl<ApplicationDef> implements ApplicationDef {

    public static final DefDescriptor<ApplicationDef> PROTOTYPE_APPLICATION = DefDescriptorImpl.getInstance(
            "markup://aura:application", ApplicationDef.class);

    protected ApplicationDefImpl(Builder builder) {
        super(builder);

        this.locationChangeEventDescriptor = builder.locationChangeEventDescriptor;

        this.layoutsDefDescriptor = builder.layoutsDefDescriptor;
        String accessName = builder.access;
        if (accessName == null) {
            this.access = Access.AUTHENTICATED;
        } else {
            this.access = Access.valueOf(accessName.toUpperCase());
        }

        this.securityProviderDescriptor = builder.securityProviderDescriptor;
        this.isAppcacheEnabled = builder.isAppcacheEnabled;
        this.additionalAppCacheURLs = builder.additionalAppCacheURLs;
        this.isOnePageApp = builder.isOnePageApp;

        if (builder.themeOverrides != null && !builder.themeOverrides.isEmpty()) {
            this.themeOverrides = new ThemeOverrideMapImpl(builder.themeOverrides, getLocation());
        } else {
            this.themeOverrides = null;
        }

        this.hashCode = AuraUtil.hashCode(super.hashCode(), themeOverrides);
    }

    public static class Builder extends BaseComponentDefImpl.Builder<ApplicationDef> implements ApplicationDefBuilder {

        public DefDescriptor<EventDef> locationChangeEventDescriptor;
        public DefDescriptor<LayoutsDef> layoutsDefDescriptor;
        public String access;
        public Boolean isAppcacheEnabled;
        public Boolean isOnePageApp;
        public DefDescriptor<SecurityProviderDef> securityProviderDescriptor;
        public String additionalAppCacheURLs;
        public Map<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> themeOverrides;

        public Builder() {
            super(ApplicationDef.class);
        }

        @Override
        public ApplicationDefImpl build() {
            return new ApplicationDefImpl(this);
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
            if (securityProviderDescriptor != null) {
                this.securityProviderDescriptor = Aura.getDefinitionService().getDefDescriptor(
                        securityProviderDescriptor, SecurityProviderDef.class);
            } else {
                this.securityProviderDescriptor = null;
            }
            return this;
        }

        @Override
        public ApplicationDefBuilder addThemeOverride(DefDescriptor<ThemeDef> original, DefDescriptor<ThemeDef> override) {
            if (themeOverrides == null) {
                themeOverrides = Maps.newHashMap();
            }
            themeOverrides.put(original, override);
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
    public DefDescriptor<LayoutsDef> getLayoutsDefDescriptor() {
        return layoutsDefDescriptor;
    }

    @Override
    protected void serializeFields(Json json) throws IOException, QuickFixException {

        DefDescriptor<EventDef> locationChangeEventDescriptor = getLocationChangeEventDescriptor();
        if (locationChangeEventDescriptor != null) {
            json.writeMapEntry("locationChangeEventDef", locationChangeEventDescriptor.getDef());
        }

        if (layoutsDefDescriptor != null) {
            json.writeMapEntry("layouts", getLayoutsDefDescriptor().getDef());
        }
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        super.retrieveLabels();

        if (layoutsDefDescriptor != null) {
            LayoutsDef layouts = layoutsDefDescriptor.getDef();
            layouts.retrieveLabels();
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        super.appendDependencies(dependencies);

        if (layoutsDefDescriptor != null) {
            dependencies.add(layoutsDefDescriptor);
        }

        if (themeOverrides != null) {
            for (Entry<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> entry : themeOverrides.map().entrySet()) {
                dependencies.add(entry.getKey());
                dependencies.add(entry.getValue());
            }
        }
    }

    @Override
    public Access getAccess() {
        return access;
    }

    @Override
    public Boolean isAppcacheEnabled() throws QuickFixException {
        return isAppcacheEnabled != null ? isAppcacheEnabled : getSuperDef().isAppcacheEnabled();
    }

    @Override
    public List<String> getAdditionalAppCacheURLs() throws QuickFixException {
        List<String> urls = Collections.emptyList();

        if (additionalAppCacheURLs != null) {
            Expression expression = AuraImpl.getExpressionAdapter().buildExpression(
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

    @Override
    public Boolean isOnePageApp() throws QuickFixException {
        return isOnePageApp;
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();

        // MasterDefRegistry reg =
        // Aura.getContextService().getCurrentContext().getDefRegistry();
        EventDef locationChangeDef = getLocationChangeEventDescriptor().getDef();
        if (!locationChangeDef.isInstanceOf(Aura.getDefinitionService().getDefDescriptor("aura:locationChange",
                EventDef.class))) {
            throw new InvalidDefinitionException(String.format("%s must extend aura:locationChange",
                    locationChangeDef.getDescriptor()), getLocation());
        }

        DefDescriptor<SecurityProviderDef> securityProviderDesc = getSecurityProviderDefDescriptor();
        if (securityProviderDesc == null) {
            throw new InvalidDefinitionException(String.format("Security provider is required on application %s",
                    getName()), getLocation());
        }
        // Will throw quickfix exception if not found.
        securityProviderDesc.getDef();

        // theme overrides
        if (themeOverrides != null) {
            themeOverrides.validate();
            for (Entry<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> entry : themeOverrides.map().entrySet()) {
                entry.getKey().getDef().validateReferences();
                entry.getValue().getDef().validateReferences();
            }
        }
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        ret.addAll(super.getBundle());
        if (layoutsDefDescriptor != null) {
            ret.add(layoutsDefDescriptor);
        }
        return ret;
    }

    @Override
    public DefDescriptor<SecurityProviderDef> getSecurityProviderDefDescriptor() throws QuickFixException {
        if (securityProviderDescriptor == null && getExtendsDescriptor() != null) {
            // going to the mdr to avoid security check, since this is used
            // during security checks and would cause spin
            return Aura.getContextService().getCurrentContext().getDefRegistry().getDef(getExtendsDescriptor())
                    .getSecurityProviderDefDescriptor();
        }
        return securityProviderDescriptor;
    }

    @Override
    public ThemeOverrideMap getThemeOverrides() {
        return themeOverrides;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof ApplicationDefImpl) {
            ApplicationDefImpl other = (ApplicationDefImpl) obj;

            return super.equals(obj)
                    && Objects.equal(this.themeOverrides, other.themeOverrides);
        }

        return false;
    }

    private final DefDescriptor<EventDef> locationChangeEventDescriptor;
    private final DefDescriptor<LayoutsDef> layoutsDefDescriptor;
    private final Access access;
    private final DefDescriptor<SecurityProviderDef> securityProviderDescriptor;
    private final ThemeOverrideMap themeOverrides;
    private final int hashCode;

    private final Boolean isAppcacheEnabled;
    private final String additionalAppCacheURLs;

    private final Boolean isOnePageApp;

    private static final long serialVersionUID = 9044177107921912717L;

}
