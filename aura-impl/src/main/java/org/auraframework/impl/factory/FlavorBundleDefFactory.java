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
package org.auraframework.impl.factory;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorBundleDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.css.flavor.FlavorBundleDefImpl;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.BundleSource;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class FlavorBundleDefFactory extends BundleBaseFactory<FlavorBundleDef> {

    @Override
    public Class<FlavorBundleDef> getDefinitionClass() {
        return FlavorBundleDef.class;
    }

    @Override
    public FlavorBundleDef getDefinition(DefDescriptor<FlavorBundleDef> descriptor,
            BundleSource<FlavorBundleDef> source) throws QuickFixException {
        FlavorBundleDefImpl.Builder builder = new FlavorBundleDefImpl.Builder();
        builder.setBundledDefs(this.buildDefinitionMap(descriptor, source.getBundledParts()));
        builder.setDescriptor(descriptor);
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        return builder.build();
    }

    @Override
    protected RootTagHandler<FlavorBundleDef> getHandler(
            DefDescriptor<FlavorBundleDef> defDescriptor,
            TextSource<FlavorBundleDef> source, XMLStreamReader xmlReader,
            boolean isInInternalNamespace, DefinitionService definitionService,
            ConfigAdapter configAdapter,
            DefinitionParserAdapter definitionParserAdapter)
            throws QuickFixException {
        return null;
    }
}
