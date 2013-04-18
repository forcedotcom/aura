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

import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef.Load;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.component.LazyComponentDefRef;
import org.auraframework.system.Source;

/**
 * Handles lazy component references
 * 
 * 
 * @since 0.0.196
 */
public class LazyComponentDefRefHandler<P extends RootDefinition> extends ComponentDefRefHandler<P> {

    protected LazyComponentDefRef.Builder lazyBuilder = new LazyComponentDefRef.Builder();

    protected LazyComponentDefRefHandler(RootTagHandler<P> parentHandler, String tag, XMLStreamReader xmlReader,
            Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder = lazyBuilder;
        builder.setLocation(getLocation());
        lazyBuilder.setRefDescriptor(Aura.getDefinitionService().getDefDescriptor(tag.trim(), ComponentDef.class));

        String loadString = getSystemAttributeValue("load");
        if (loadString != null) {
            Load load = Load.valueOf(loadString.toUpperCase());
            if (load == Load.EXCLUSIVE) {
                lazyBuilder.setComponentAttribute("exclusive", true);
            }
        }
    }

}
