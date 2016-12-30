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
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDefRef;
import org.auraframework.impl.root.parser.handler.ParentedTagHandler;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.modules.impl.def.ModuleDefRefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Created by byao on 12/30/16.
 */
public class ModuleDefRefHandler<P extends RootDefinition> extends ParentedTagHandler<ModuleDefRef, P> {

    protected ModuleDefRefImpl.Builder builder = new ModuleDefRefImpl.Builder();

    public ModuleDefRefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source,
                               boolean isInInternalNamespace, DefinitionService definitionService,
                               ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        DefDescriptor<ModuleDef> moduleDefDescriptor = definitionService.getDefDescriptor(getTagName(), ModuleDef.class);
        builder.setDescriptor(moduleDefDescriptor);
        builder.setLocation(getLocation());
        builder.setOwnHash(source.getHash());
        builder.setAccess(getAccess(isInInternalNamespace));
    }

    @Override
    public String getHandledTag() {
        return "module reference";
    }

    @Override
    protected boolean handlesTag(String tag) {
        return true;
    }

    @Override
    protected ModuleDefRef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
