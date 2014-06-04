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
import org.auraframework.impl.root.theme.Themes;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.base.Splitter;
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
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInPrivilegedNamespace ? PRIVILEGED_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
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
                ddb.setType("APPLICATION,COMPONENT,STYLE,EVENT");
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

        String themeNames = getAttributeValue(ATTRIBUTE_THEME);
        if (themeNames != null) {
            // an empty string is a valid value, and it means don't use any theme.
            // this is a way to opt-out of the implicit default (below)
            if (!AuraTextUtil.isNullEmptyOrWhitespace(themeNames)) {
                for (String name : Splitter.on(',').trimResults().omitEmptyStrings().split(themeNames)) {
                    appBuilder.appendThemeDescriptor(DefDescriptorImpl.getInstance(name, ThemeDef.class));
                }
            }
        } else {
            // the implicit theme override for an app is the namespace-default theme, if it exists
            DefDescriptor<ThemeDef> namespaceTheme = Themes.getNamespaceDefaultTheme(defDescriptor);
            if (namespaceTheme.exists()) {
                appBuilder.appendThemeDescriptor(namespaceTheme);
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

    @Override
    protected boolean allowAuthenticationAttribute() {
        return true;
    }

    private static final String ATTRIBUTE_PRELOAD = "preload";
    private static final String ATTRIBUTE_LAYOUTS = "layouts";
    private static final String ATTRIBUTE_LOCATION_CHANGE_EVENT = "locationChangeEvent";
    private static final String ATTRIBUTE_APPCACHE_ENABLED = "useAppcache";
    private static final String ATTRIBUTE_ADDITIONAL_APPCACHE_URLS = "additionalAppCacheURLs";
    private static final String ATTRIBUTE_IS_ONE_PAGE_APP = "isOnePageApp";
    private static final String ATTRIBUTE_THEME = "theme";

    private static final Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .add(ATTRIBUTE_APPCACHE_ENABLED)
            .addAll(BaseComponentDefHandler.ALLOWED_ATTRIBUTES).build();

    private static final Set<String> PRIVILEGED_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(
            ATTRIBUTE_PRELOAD, ATTRIBUTE_LAYOUTS, ATTRIBUTE_LOCATION_CHANGE_EVENT,
            ATTRIBUTE_ADDITIONAL_APPCACHE_URLS, ATTRIBUTE_IS_ONE_PAGE_APP, ATTRIBUTE_THEME)
            .addAll(ALLOWED_ATTRIBUTES)
            .addAll(BaseComponentDefHandler.PRIVILEGED_ALLOWED_ATTRIBUTES)
            .build();
}
