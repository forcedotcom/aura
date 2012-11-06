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
package org.auraframework.impl.root.parser.handler;

import java.io.IOException;
import java.util.*;

import javax.xml.stream.XMLStreamReader;

import com.google.common.collect.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.impl.root.application.ApplicationDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

/**
 */
public class ApplicationDefHandler extends BaseComponentDefHandler<ApplicationDef> {

    public static final String TAG = "aura:application";

    private static final String ATTRIBUTE_PRELOAD = "preload";
    private static final String ATTRIBUTE_LAYOUTS = "layouts";
    private static final String ATTRIBUTE_LOCATION_CHANGE_EVENT = "locationChangeEvent";
    private static final String ATTRIBUTE_ACCESS = "access";
    private static final String ATTRIBUTE_SECURITY_PROVIDER = "securityProvider";
    private static final String ATTRIBUTE_APPCACHE_ENABLED = "useAppcache";


    private final static Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
    .add(ATTRIBUTE_PRELOAD,
         ATTRIBUTE_LAYOUTS,
         ATTRIBUTE_LOCATION_CHANGE_EVENT,
         ATTRIBUTE_PRELOAD,
         ATTRIBUTE_ACCESS,
         ATTRIBUTE_SECURITY_PROVIDER,
         ATTRIBUTE_APPCACHE_ENABLED)
    .addAll(BaseComponentDefHandler.ALLOWED_ATTRIBUTES)
    .build();

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

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();


        appBuilder.setSecurityProviderDescriptor(getAttributeValue(ATTRIBUTE_SECURITY_PROVIDER));

        appBuilder.access = getAttributeValue(ATTRIBUTE_ACCESS);

        String locationChangeEvent = getAttributeValue(ATTRIBUTE_LOCATION_CHANGE_EVENT);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(locationChangeEvent)) {
            appBuilder.locationChangeEventDescriptor = DefDescriptorImpl.getInstance(locationChangeEvent, EventDef.class);
        }


        String layouts = getAttributeValue(ATTRIBUTE_LAYOUTS);
        DefDescriptor<LayoutsDef> layoutsDefDescriptor = null;

        if(layouts == null){
            layoutsDefDescriptor = DefDescriptorImpl.getAssociateDescriptor(builder.getDescriptor(), LayoutsDef.class, DefDescriptor.MARKUP_PREFIX);
            if(!layoutsDefDescriptor.exists()){
                layoutsDefDescriptor = null;
            }
        } else if (!AuraTextUtil.isNullEmptyOrWhitespace(layouts)) {
            layoutsDefDescriptor = DefDescriptorImpl.getInstance(layouts, LayoutsDef.class);
        }
        appBuilder.layoutsDefDescriptor = layoutsDefDescriptor;



        String preloadNames = getAttributeValue(ATTRIBUTE_PRELOAD);
        if(!AuraTextUtil.isNullEmptyOrWhitespace(preloadNames)){
            appBuilder.preloads = Sets.newHashSet();
            List<String> preloads = AuraTextUtil.splitSimple(",", preloadNames);
            for(String preload : preloads){
                appBuilder.preloads.add(preload.trim());
            }
        }
        String isAppcacheEnabled = getAttributeValue(ATTRIBUTE_APPCACHE_ENABLED);
        if(!AuraTextUtil.isNullEmptyOrWhitespace(isAppcacheEnabled)){
            appBuilder.isAppcacheEnabled = Boolean.parseBoolean(isAppcacheEnabled);
        }
    }

    @Override
    public void writeElement(ApplicationDef def, Appendable out) throws IOException {
        try {
            Map<String, Object> attributes = Maps.newHashMap();
            attributes.put("def", def);
            InstanceService instanceService = Aura.getInstanceService();
            DefinitionService definitionService = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> tmplDesc = definitionService.getDefDescriptor("auradev:saveApplication", ComponentDef.class);
            Component tmpl = instanceService.getInstance(tmplDesc, attributes);
            Aura.getRenderingService().render(tmpl, out);
        } catch (QuickFixException x) {
            throw new AuraError(x);
        }
    }

}
