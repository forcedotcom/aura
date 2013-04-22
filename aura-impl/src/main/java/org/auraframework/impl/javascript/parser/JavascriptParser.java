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

import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.HelperDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.javascript.parser.handler.JavascriptControllerDefHandler;
import org.auraframework.impl.javascript.parser.handler.JavascriptHandler;
import org.auraframework.impl.javascript.parser.handler.JavascriptHelperDefHandler;
import org.auraframework.impl.javascript.parser.handler.JavascriptModelDefHandler;
import org.auraframework.impl.javascript.parser.handler.JavascriptRendererDefHandler;
import org.auraframework.impl.javascript.parser.handler.JavascriptTestSuiteDefHandler;
import org.auraframework.impl.javascript.provider.JavascriptProviderDef;
import org.auraframework.system.Location;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

public class JavascriptParser implements Parser {

    private static JavascriptParser instance = new JavascriptParser();

    public static JavascriptParser getInstance() {
        return instance;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> D parse(DefDescriptor<D> descriptor, Source<?> source) throws QuickFixException {
        switch (descriptor.getDefType()) {
        case CONTROLLER:
            return (D) new JavascriptControllerDefHandler((DefDescriptor<ControllerDef>) descriptor, source)
                    .getDefinition();
        case RENDERER:
            return (D) new JavascriptRendererDefHandler((DefDescriptor<RendererDef>) descriptor, source)
                    .getDefinition();
        case HELPER:
            return (D) new JavascriptHelperDefHandler((DefDescriptor<HelperDef>) descriptor, source).getDefinition();
        case TESTSUITE:
            return (D) new JavascriptTestSuiteDefHandler((DefDescriptor<TestSuiteDef>) descriptor, source)
                    .getDefinition();
        case PROVIDER:
            Location location = new Location(source.getSystemId(), source.getLastModified());
            JavascriptProviderDef.Builder builder = new JavascriptProviderDef.Builder();
            builder.setDescriptor((DefDescriptor<ProviderDef>) descriptor);
            builder.setLocation(location);
            builder.code = JavascriptHandler.getCompressedSource(source);
            builder.setOwnHash(source.getHash());
            return (D) builder.build();
        case MODEL: {
            return (D) new JavascriptModelDefHandler((DefDescriptor<ModelDef>) descriptor, source).getDefinition();
        }
        default:
            return null;
        }
    }
}
