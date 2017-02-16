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
package org.auraframework.impl.root.parser.handler.module;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDefRef;
import org.auraframework.impl.root.parser.handler.BaseDefRefHandler;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.impl.root.component.ModuleDefRefImpl;
import org.auraframework.impl.root.component.ModuleDefRefImpl.Builder;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;

/**
 * Module definition reference handler.
 * Uses same base handler as ComponentDefRef
 */
public class ModuleDefRefHandler<P extends RootDefinition> extends BaseDefRefHandler<ModuleDefRef, P, ModuleDef, Builder> {

    protected ModuleDefRefImpl.Builder builder = new ModuleDefRefImpl.Builder();

    public ModuleDefRefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                               boolean isInInternalNamespace, DefinitionService definitionService,
                               ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
    }

    @Override
    protected Builder createBuilder() {
        Builder builder = new Builder();
        builder.setDescriptor(definitionService.getDefDescriptor(getTagName(), ModuleDef.class));
        builder.setHasFlavorableChild(false);
        builder.setIsFlavorable(false);
        return builder;
    }

    @Override
    public String getHandledTag() {
        return "module reference";
    }
}
