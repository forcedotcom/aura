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
package org.auraframework.impl.root.parser.handler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.LayoutsDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.root.DependencyDefImpl;
import org.auraframework.impl.root.application.ApplicationDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;

public class ApplicationDefHandler extends BaseComponentDefHandler<ApplicationDef> {

    public static final String TAG = "aura:application";

    public ApplicationDefImpl.Builder appBuilder;

    public ApplicationDefHandler() {
        super();
    }

    public ApplicationDefHandler(DefDescriptor<ApplicationDef> applicationDefDescriptor, Source<ApplicationDef> source,
            XMLStreamReader xmlReader) {
        super(applicationDefDescriptor, source, xmlReader);
        appBuilder = (ApplicationDefImpl.Builder) builder;
        appBuilder.themeOverrides = Maps.newHashMap();
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected ApplicationDefImpl.Builder createBuilder() {
        return new ApplicationDefImpl.Builder();
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    /**
     * Allows embedded script tags by default in applications
     * 
     * @return - return true if your instance should allow embedded script tags in HTML
     */
    @Override
    public boolean getAllowsScript() {
        return true;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();

        appBuilder.setSecurityProviderDescriptor(getAttributeValue(ATTRIBUTE_SECURITY_PROVIDER));

        appBuilder.access = getAttributeValue(ATTRIBUTE_ACCESS);

        String locationChangeEvent = getAttributeValue(ATTRIBUTE_LOCATION_CHANGE_EVENT);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(locationChangeEvent)) {
            appBuilder.locationChangeEventDescriptor = DefDescriptorImpl.getInstance(locationChangeEvent,
                    EventDef.class);
        }

        String layouts = getAttributeValue(ATTRIBUTE_LAYOUTS);
        DefDescriptor<LayoutsDef> layoutsDefDescriptor = null;

        if (layouts == null) {
            layoutsDefDescriptor = DefDescriptorImpl.getAssociateDescriptor(builder.getDescriptor(), LayoutsDef.class,
                    DefDescriptor.MARKUP_PREFIX);
            if (!layoutsDefDescriptor.exists()) {
                layoutsDefDescriptor = null;
            }
        } else if (!AuraTextUtil.isNullEmptyOrWhitespace(layouts)) {
            layoutsDefDescriptor = DefDescriptorImpl.getInstance(layouts, LayoutsDef.class);
        }
        appBuilder.layoutsDefDescriptor = layoutsDefDescriptor;

        String preloadNames = getAttributeValue(ATTRIBUTE_PRELOAD);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(preloadNames)) {
            List<String> preloads = AuraTextUtil.splitSimple(",", preloadNames);
            for (String preload : preloads) {
                DependencyDefImpl.Builder ddb = new DependencyDefImpl.Builder();
                ddb.setParentDescriptor(this.defDescriptor);
                ddb.setLocation(getLocation());
                ddb.setResource(preload);
                ddb.setType("*");
                appBuilder.addDependency(ddb.build());
            }
        }

        String isAppcacheEnabled = getAttributeValue(ATTRIBUTE_APPCACHE_ENABLED);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(isAppcacheEnabled)) {
            appBuilder.isAppcacheEnabled = Boolean.parseBoolean(isAppcacheEnabled);
        }

        String additionalAppCacheURLs = getAttributeValue(ATTRIBUTE_ADDITIONAL_APPCACHE_URLS);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(additionalAppCacheURLs)) {
            appBuilder.additionalAppCacheURLs = additionalAppCacheURLs;
        }

        String isOnePageApp = getAttributeValue(ATTRIBUTE_IS_ONE_PAGE_APP);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(isOnePageApp)) {
            appBuilder.isOnePageApp = Boolean.parseBoolean(isOnePageApp);
        } else {
            appBuilder.isOnePageApp = false;
        }

        // theme overrides
        String themeOverrideNames = getAttributeValue(ATTRIBUTE_THEME_OVERRIDES);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(themeOverrideNames)) {

            DefinitionService defService = Aura.getDefinitionService();

            for (String overrideString : AuraTextUtil.splitSimple(",", themeOverrideNames)) {
                List<String> parts = AuraTextUtil.splitSimple("=", overrideString);
                if (parts.size() != 2) {
                    throw new AuraRuntimeException(String.format(THEME_FORMAT, overrideString), getLocation());
                }

                String original = parts.get(0);
                String override = parts.get(1);

                if (AuraTextUtil.isEmptyOrWhitespace(original) || AuraTextUtil.isEmptyOrWhitespace(override)) {
                    throw new AuraRuntimeException(String.format(THEME_FORMAT, overrideString), getLocation());
                }

                DefDescriptor<ThemeDef> originalDescriptor = defService.getDefDescriptor(original, ThemeDef.class);
                DefDescriptor<ThemeDef> overrideDescriptor = defService.getDefDescriptor(override, ThemeDef.class);

                appBuilder.addThemeOverride(originalDescriptor, overrideDescriptor);
            }
        }
    }

    @Override
    public void writeElement(ApplicationDef def, Appendable out) throws IOException {
        try {
            Map<String, Object> attributes = Maps.newHashMap();
            attributes.put("def", def);
            InstanceService instanceService = Aura.getInstanceService();
            DefinitionService definitionService = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> tmplDesc = definitionService.getDefDescriptor("auradev:saveApplication",
                    ComponentDef.class);
            Component tmpl = instanceService.getInstance(tmplDesc, attributes);
            Aura.getRenderingService().render(tmpl, out);
        } catch (QuickFixException x) {
            throw new AuraError(x);
        }
    }

    private static final String ATTRIBUTE_PRELOAD = "preload";
    private static final String ATTRIBUTE_LAYOUTS = "layouts";
    private static final String ATTRIBUTE_LOCATION_CHANGE_EVENT = "locationChangeEvent";
    private static final String ATTRIBUTE_ACCESS = "access";
    private static final String ATTRIBUTE_SECURITY_PROVIDER = "securityProvider";
    private static final String ATTRIBUTE_APPCACHE_ENABLED = "useAppcache";
    private static final String ATTRIBUTE_ADDITIONAL_APPCACHE_URLS = "additionalAppCacheURLs";
    private static final String ATTRIBUTE_IS_ONE_PAGE_APP = "isOnePageApp";
    private static final String ATTRIBUTE_THEME_OVERRIDES = "themeOverrides";

    private static final String THEME_FORMAT = "Invalid themeOverrides format '%s'. Try rewriting like theme1=theme2";

    private final static Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .add(ATTRIBUTE_PRELOAD, ATTRIBUTE_LAYOUTS, ATTRIBUTE_LOCATION_CHANGE_EVENT, ATTRIBUTE_PRELOAD,
                    ATTRIBUTE_ACCESS, ATTRIBUTE_SECURITY_PROVIDER, ATTRIBUTE_APPCACHE_ENABLED,
                    ATTRIBUTE_ADDITIONAL_APPCACHE_URLS, ATTRIBUTE_IS_ONE_PAGE_APP, ATTRIBUTE_THEME_OVERRIDES)
            .addAll(BaseComponentDefHandler.ALLOWED_ATTRIBUTES).build();
}
