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

import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LayoutsDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.system.Source;

public class RootTagHandlerFactory {

    @SuppressWarnings("unchecked")
    public static <T extends RootDefinition> RootTagHandler<T> newInstance(DefDescriptor<T> defDescriptor,
            Source<T> source, XMLStreamReader xmlReader) {
        switch (defDescriptor.getDefType()) {
        case APPLICATION:
            return (RootTagHandler<T>) new ApplicationDefHandler((DefDescriptor<ApplicationDef>) defDescriptor,
                    (Source<ApplicationDef>) source, xmlReader);
        case COMPONENT:
            return (RootTagHandler<T>) new ComponentDefHandler((DefDescriptor<ComponentDef>) defDescriptor,
                    (Source<ComponentDef>) source, xmlReader);
        case EVENT:
            return (RootTagHandler<T>) new EventDefHandler((DefDescriptor<EventDef>) defDescriptor,
                    (Source<EventDef>) source, xmlReader);
        case INTERFACE:
            return (RootTagHandler<T>) new InterfaceDefHandler((DefDescriptor<InterfaceDef>) defDescriptor,
                    (Source<InterfaceDef>) source, xmlReader);
        case LAYOUTS:
            return (RootTagHandler<T>) new LayoutsDefHandler((DefDescriptor<LayoutsDef>) defDescriptor,
                    (Source<LayoutsDef>) source, xmlReader);
        default:
            throw new UnsupportedOperationException();
        }
    }
}
