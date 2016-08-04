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
package org.auraframework.impl.javascript.parser;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.javascript.parser.handler.JavascriptControllerDefHandler;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class JavascriptControllerParser implements Parser<ControllerDef> {

    @Override
    public Format getFormat() {
        return Format.JS;
    }

    @Override
    public DefType getDefType() {
        return DefType.CONTROLLER;
    }
    
    @Override
    public ControllerDef parse(DefDescriptor<ControllerDef> descriptor, Source<ControllerDef> source)
            throws QuickFixException {
        return new JavascriptControllerDefHandler(descriptor, source).getDefinition();
    }
}
