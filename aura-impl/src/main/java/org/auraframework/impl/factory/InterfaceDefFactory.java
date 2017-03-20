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
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.root.parser.handler.InterfaceDefHandler;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;

@ServiceComponent
public class InterfaceDefFactory extends BundleBaseFactory<InterfaceDef> {

    @Override
    public Class<InterfaceDef> getDefinitionClass() {
        return InterfaceDef.class;
    }

    @Override
    public String getMimeType() {
        return "";
    }

    @Override
    protected InterfaceDefHandler getHandler(DefDescriptor<InterfaceDef> descriptor,
                                             TextSource<InterfaceDef> source, XMLStreamReader xmlReader,
                                             boolean isInInternalNamespace, DefinitionService definitionService,
                                             ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        return new InterfaceDefHandler(descriptor, source, xmlReader, isInInternalNamespace, definitionService,
                contextService, configAdapter, definitionParserAdapter);
    }
}
