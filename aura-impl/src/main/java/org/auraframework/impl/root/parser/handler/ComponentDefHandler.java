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
import java.util.Map;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;

/**
 */
public class ComponentDefHandler extends BaseComponentDefHandler<ComponentDef, ComponentDefImpl.Builder> {

    public static final String TAG = "aura:component";

    private static final String ATTRIBUTE_ISTEMPLATE = "isTemplate";

    private static final Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .add(ATTRIBUTE_ISTEMPLATE)
            .addAll(BaseComponentDefHandler.ALLOWED_ATTRIBUTES).build();

    private static final Set<String> PRIVILEGED_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .addAll(ALLOWED_ATTRIBUTES)
            .addAll(BaseComponentDefHandler.PRIVILEGED_ALLOWED_ATTRIBUTES)
            .build();
    
    public ComponentDefHandler() {
        super();
    }

    public ComponentDefHandler(DefDescriptor<ComponentDef> componentDefDescriptor, Source<?> source,
            XMLStreamReader xmlReader) {
        super(componentDefDescriptor, source, xmlReader);
    }

    @Override
    protected ComponentDefImpl.Builder createBuilder() {
        return new ComponentDefImpl.Builder();
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInPrivilegedNamespace ? PRIVILEGED_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();
        builder.isTemplate = getBooleanAttributeValue(ATTRIBUTE_ISTEMPLATE);
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        super.handleChildTag();
    }

    @Override
    public void writeElement(ComponentDef def, Appendable out) throws IOException {
        try {
            Map<String, Object> attributes = Maps.newHashMap();
            attributes.put("def", def);
            InstanceService instanceService = Aura.getInstanceService();
            DefinitionService definitionService = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> tmplDesc = definitionService.getDefDescriptor("auradev:saveComponent",
                    ComponentDef.class);
            Component tmpl = instanceService.getInstance(tmplDesc, attributes);
            Aura.getRenderingService().render(tmpl, out);
        } catch (QuickFixException x) {
            throw new AuraError(x);
        }
    }
    
}
