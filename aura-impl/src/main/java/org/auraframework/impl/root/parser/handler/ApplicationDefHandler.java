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

import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.impl.root.DependencyDefImpl;
import org.auraframework.impl.root.application.ApplicationDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class ApplicationDefHandler extends BaseComponentDefHandler<ApplicationDef, ApplicationDefImpl.Builder> {

    public static final String TAG = "aura:application";

    public ApplicationDefHandler() {
        super();
    }

    public ApplicationDefHandler(DefDescriptor<ApplicationDef> applicationDefDescriptor, Source<ApplicationDef> source,
            XMLStreamReader xmlReader) {
        super(applicationDefDescriptor, source, xmlReader);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInInternalNamespace ? INTERNAL_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
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
            builder.locationChangeEventDescriptor = DefDescriptorImpl.getInstance(locationChangeEvent,
                    EventDef.class);
        }

        String preloadNames = getAttributeValue(ATTRIBUTE_PRELOAD);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(preloadNames)) {
            List<String> preloads = AuraTextUtil.splitSimple(",", preloadNames);
            for (String preload : preloads) {
                DependencyDefImpl.Builder ddb = new DependencyDefImpl.Builder();
                ddb.setParentDescriptor(this.defDescriptor);
                ddb.setLocation(getLocation());
                ddb.setResource(preload);
                ddb.setType("APPLICATION,COMPONENT,STYLE,EVENT");
                builder.addDependency(ddb.build());
            }
        }

        String isAppcacheEnabled = getAttributeValue(ATTRIBUTE_APPCACHE_ENABLED);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(isAppcacheEnabled)) {
            builder.isAppcacheEnabled = Boolean.parseBoolean(isAppcacheEnabled);
        }

        String additionalAppCacheURLs = getAttributeValue(ATTRIBUTE_ADDITIONAL_APPCACHE_URLS);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(additionalAppCacheURLs)) {
            builder.additionalAppCacheURLs = additionalAppCacheURLs;
        }

        String isOnePageApp = getAttributeValue(ATTRIBUTE_IS_ONE_PAGE_APP);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(isOnePageApp)) {
            builder.isOnePageApp = Boolean.parseBoolean(isOnePageApp);
        } else {
            builder.isOnePageApp = false;
        }

        // this should be in base component handler, but if we automatically add it from there it results
        // in the flavor CSS always being included in app.css (from the dependencies). We only want it if
        // the cmp is top-level. need to figure out something better.
        String flavorOverrides = getAttributeValue(ATTRIBUTE_FLAVOR_OVERRIDES);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(flavorOverrides)) {
            builder.setFlavorOverrides(DefDescriptorImpl.getInstance(flavorOverrides, FlavorsDef.class));
        } else {
            // see if there is a flavors file in the bundle
            DefDescriptor<FlavorsDef> flavors = DefDescriptorImpl.getAssociateDescriptor(
                    builder.getDescriptor(), FlavorsDef.class, DefDescriptor.MARKUP_PREFIX);
            if (flavors.exists()) {
                builder.setFlavorOverrides(flavors);
            }
        }
    }

    @Override
    protected boolean allowAuthenticationAttribute() {
        return true;
    }

    private static final String ATTRIBUTE_PRELOAD = "preload";
    private static final String ATTRIBUTE_LOCATION_CHANGE_EVENT = "locationChangeEvent";
    private static final String ATTRIBUTE_APPCACHE_ENABLED = "useAppcache";
    private static final String ATTRIBUTE_ADDITIONAL_APPCACHE_URLS = "additionalAppCacheURLs";
    private static final String ATTRIBUTE_IS_ONE_PAGE_APP = "isOnePageApp";
    private static final String ATTRIBUTE_FLAVOR_OVERRIDES = "flavorOverrides";

    private static final Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .add(ATTRIBUTE_APPCACHE_ENABLED, ATTRIBUTE_ADDITIONAL_APPCACHE_URLS)
            .add(ATTRIBUTE_TEMPLATE)
            .addAll(BaseComponentDefHandler.ALLOWED_ATTRIBUTES).build();

    private static final Set<String> INTERNAL_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(
            ATTRIBUTE_PRELOAD, ATTRIBUTE_LOCATION_CHANGE_EVENT, ATTRIBUTE_IS_ONE_PAGE_APP, ATTRIBUTE_FLAVOR_OVERRIDES)
            .addAll(ALLOWED_ATTRIBUTES)
            .addAll(BaseComponentDefHandler.INTERNAL_ALLOWED_ATTRIBUTES)
            .build();
}
