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
package org.auraframework.test.source;

import java.io.File;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.SourceLoader;
import org.springframework.context.annotation.Lazy;

import com.google.common.collect.Sets;

@Lazy
@ServiceComponent
public class StringComponentLocationAdapter implements ComponentLocationAdapter {

    @Inject
    StringSourceLoader loader;

    Set<SourceLoader> theSet = null;

    public StringComponentLocationAdapter() {
    }

    @Override
    public File getComponentSourceDir() {
        return null;
    }

    @Override
    public File getJavaGeneratedSourceDir() {
        return null;
    }

    @Override
    public String getComponentSourcePackage() {
        return null;
    }

    @Override
    public Set<SourceLoader> getSourceLoaders() {
        if (theSet == null) {
            theSet = Sets.newHashSet(loader);
        }
        return theSet;
    }

    @Override
    public DefType type() {
        return DefType.COMPONENT;
    }
}
