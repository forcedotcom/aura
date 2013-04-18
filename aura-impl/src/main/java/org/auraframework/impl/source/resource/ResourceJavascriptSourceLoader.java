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
package org.auraframework.impl.source.resource;

import java.util.EnumMap;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;

import com.google.common.collect.ImmutableSet;

/**
 */
public class ResourceJavascriptSourceLoader extends ResourceSourceLoader {

    public static final Set<String> PREFIXES = ImmutableSet.of(DefDescriptor.JAVASCRIPT_PREFIX);
    private static final EnumMap<DefType, String> extensions = new EnumMap<DefType, String>(DefType.class);

    static {
        extensions.put(DefType.CONTROLLER, "Controller.js");
        extensions.put(DefType.RENDERER, "Renderer.js");
        extensions.put(DefType.TESTSUITE, "Test.js");
        extensions.put(DefType.PROVIDER, "Provider.js");
        extensions.put(DefType.HELPER, "Helper.js");
        extensions.put(DefType.MODEL, "Model.js");
    }

    public ResourceJavascriptSourceLoader(String basePackage) {
        super(basePackage);
    }

    @Override
    protected String getPath(DefDescriptor<?> descriptor) {
        // Get rid of the inner type qualifier.
        String jsFilename = String.format("%s/%s/%s%s", descriptor.getNamespace(), descriptor.getName(),
                descriptor.getName(), extensions.get(descriptor.getDefType()));

        return jsFilename;
    }

    @Override
    public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        return new ResourceSource<D>(descriptor, resourcePrefix + "/" + getPath(descriptor), Format.JS);
    }

    @Override
    public Set<String> getPrefixes() {
        return PREFIXES;
    }
}
