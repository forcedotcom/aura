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

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.root.DependencyDefImpl;
import org.auraframework.impl.root.application.ApplicationDefImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class ApplicationDefHandler extends BaseComponentDefHandler<ApplicationDef, ApplicationDefImpl.Builder> {

    public static final String TAG = "aura:application";

    public ApplicationDefHandler() {
        super();
    }

    public ApplicationDefHandler(DefDescriptor<ApplicationDef> applicationDefDescriptor, TextSource<ApplicationDef> source,
                                 XMLStreamReader xmlReader, boolean isInInternalNamespace, DefinitionService definitionService,
                                 ContextService contextService,
                                 ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(applicationDefDescriptor, source, xmlReader, isInInternalNamespace, definitionService, contextService, configAdapter, definitionParserAdapter, new ApplicationDefImpl.Builder());
    }

    @Override
    public Set<String> getAllowedAttributes() {
        Set<String> allowed = isInInternalNamespace ? INTERNAL_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
        
        Set<String> extraAllowed = definitionParserAdapter.getAdditionalAllowedAttributes(getDefDescriptor().getDefType());
        if (extraAllowed != null) {
            allowed = ImmutableSet.<String>builder().addAll(allowed).addAll(extraAllowed).build();
        }
        
        return allowed;
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
            builder.locationChangeEventDescriptor = definitionService.getDefDescriptor(locationChangeEvent,
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

        String trackedDependecies = getAttributeValue(ATTRIBUTE_TRACK);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(trackedDependecies)) {
            List<String> trackedList = AuraTextUtil.splitSimple(",", trackedDependecies);
            for (String tracked : trackedList) {
            	DefDescriptor<ComponentDef> trackedDef = definitionService.getDefDescriptor(tracked, ComponentDef.class);
            	builder.addTrackedDependency(trackedDef);
            }
        }

        String services = getAttributeValue(ATTRIBUTE_SERVICES);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(services)) {
            builder.setModuleServices(services);
        }

        String isAppcacheEnabled = getAttributeValue(ATTRIBUTE_APPCACHE_ENABLED);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(isAppcacheEnabled)) {
            builder.isAppcacheEnabled = Boolean.parseBoolean(isAppcacheEnabled);
        }

        String additionalAppCacheURLs = getAttributeValue(ATTRIBUTE_ADDITIONAL_APPCACHE_URLS);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(additionalAppCacheURLs)) {
            builder.additionalAppCacheURLs = additionalAppCacheURLs;
        }

        String tokenOverrides = getAttributeValue(ATTRIBUTE_TOKEN_OVERRIDES);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(tokenOverrides)) {
            builder.setTokenOverrides(tokenOverrides);
        }
        
        String flavorOverrides = getAttributeValue(ATTRIBUTE_FLAVOR_OVERRIDES);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(flavorOverrides)) {
            builder.setFlavorOverrides(definitionService.getDefDescriptor(flavorOverrides, FlavorsDef.class));
        } else {
            FlavorsDef flavors = getBundledDef(FlavorsDef.class, DefDescriptor.MARKUP_PREFIX);
            if (flavors != null) {
                builder.setFlavorOverrides(flavors);
            }
        }

        String bootstrapPublicCacheExpiration = getAttributeValue(ATTRIBUTE_BOOTSTRAP_PUBLIC_CACHE_EXPIRATION);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(bootstrapPublicCacheExpiration)) {
            builder.bootstrapPublicCacheExpiration = bootstrapPublicCacheExpiration;
        }
    }

    @Override
    protected boolean allowAuthenticationAttribute() {
        return true;
    }

    private static final String ATTRIBUTE_PRELOAD = "preload";
    private static final String ATTRIBUTE_TRACK = "track";
    private static final String ATTRIBUTE_SERVICES = "services";
    private static final String ATTRIBUTE_LOCATION_CHANGE_EVENT = "locationChangeEvent";
    private static final String ATTRIBUTE_APPCACHE_ENABLED = "useAppcache";
    private static final String ATTRIBUTE_ADDITIONAL_APPCACHE_URLS = "additionalAppCacheURLs";
    private static final String ATTRIBUTE_TOKEN_OVERRIDES = "tokens";
    private static final String ATTRIBUTE_FLAVOR_OVERRIDES = "flavorOverrides";
    private static final String ATTRIBUTE_BOOTSTRAP_PUBLIC_CACHE_EXPIRATION = "bootstrapPublicCacheExpiration";

    private static final Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .add(ATTRIBUTE_APPCACHE_ENABLED, ATTRIBUTE_ADDITIONAL_APPCACHE_URLS)
            .add(ATTRIBUTE_TEMPLATE)
            .addAll(BaseComponentDefHandler.ALLOWED_ATTRIBUTES).build();

    private static final Set<String> INTERNAL_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(
            ATTRIBUTE_PRELOAD, ATTRIBUTE_TRACK, ATTRIBUTE_LOCATION_CHANGE_EVENT,
            ATTRIBUTE_TOKEN_OVERRIDES, ATTRIBUTE_SERVICES, ATTRIBUTE_FLAVOR_OVERRIDES, ATTRIBUTE_BOOTSTRAP_PUBLIC_CACHE_EXPIRATION)
            .addAll(ALLOWED_ATTRIBUTES)
            .addAll(BaseComponentDefHandler.INTERNAL_ALLOWED_ATTRIBUTES)
            .build();
}
