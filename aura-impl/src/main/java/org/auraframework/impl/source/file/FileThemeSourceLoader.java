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
package org.auraframework.impl.source.file;

import java.io.File;
import java.util.EnumSet;
import java.util.Set;

import com.google.common.collect.ImmutableSet;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.Parser.Format;

public class FileThemeSourceLoader extends FileSourceLoader {

    public static final Set<String> PREFIXES = ImmutableSet.of("css", "templateCss");
    private static final Set<DefType> DEFTYPES = EnumSet.of(DefType.STYLE);

    public FileThemeSourceLoader(File base) {
        super(base);
    }

    @Override
    public <D extends Definition> FileSource<D> getSource(DefDescriptor<D> descriptor) {
        String cssFilename = String.format("%s/%s/%s%s", descriptor.getNamespace(), descriptor.getName(),
                descriptor.getName(), ".css");
        File cssFile = new File(base, cssFilename);
        String cssName = String.format("%s://%s.%s", descriptor.getPrefix(), descriptor.getNamespace(),
                descriptor.getName());
        return new FileThemeSource<D>(descriptor, cssName, cssFile,
                descriptor.getPrefix().equals("templateCss") ? Format.TEMPLATE_CSS : Format.CSS);
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
