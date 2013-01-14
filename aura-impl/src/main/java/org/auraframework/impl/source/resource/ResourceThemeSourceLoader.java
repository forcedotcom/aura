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
package org.auraframework.impl.source.resource;

import java.util.EnumSet;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;

import com.google.common.collect.ImmutableSet;

public class ResourceThemeSourceLoader extends ResourceSourceLoader {

    public static final Set<String> PREFIXES = ImmutableSet.of(DefDescriptor.CSS_PREFIX,
            DefDescriptor.TEMPLATE_CSS_PREFIX);
    private static final Set<DefType> DEFTYPES = EnumSet.of(DefType.STYLE);

    public ResourceThemeSourceLoader(String basePackage) {
        super(basePackage);
    }

    @Override
    protected String getPath(DefDescriptor<?> descriptor) {
        // Get rid of the inner type qualifier.
        String cssFilename = String.format("%s/%s/%s%s", descriptor.getNamespace(), descriptor.getName(),
                descriptor.getName(), ".css");

        return cssFilename;
    }

    @Override
    public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        return new ResourceSource<D>(descriptor, resourcePrefix + "/" + getPath(descriptor), descriptor.getPrefix()
                .equals("templateCss") ? Format.TEMPLATE_CSS : Format.CSS);
    }

    @Override
    public Set<String> getPrefixes() {
        return PREFIXES;
    }

    @Override
    public Set<DefType> getDefTypes() {
        return DEFTYPES;
    }
}
