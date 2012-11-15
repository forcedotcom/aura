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
package org.auraframework.impl;

import java.io.File;
import java.util.Date;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.system.Source;
import org.auraframework.test.AuraTestingUtil;

import com.google.common.collect.Sets;

public class AuraTestingUtilImpl implements AuraTestingUtil {
    private final Set<DefDescriptor<?>> cleanUpDds = Sets.newHashSet();

    public AuraTestingUtilImpl() {}

    @Override
    public void setUp() {
        // Do nothing
    }

    @Override
    public void tearDown() {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        for (DefDescriptor<?> dd : cleanUpDds) {
            loader.removeSource(dd);
        }
        cleanUpDds.clear();
    }

    @Override
    public File getAuraJavascriptSourceDirectory() {
        return AuraImplFiles.AuraJavascriptSourceDirectory.asFile();
    }

    @Override
    public Source<?> getSource(DefDescriptor<?> descriptor) {
        return Aura.getContextService().getCurrentContext().getDefRegistry().getSource(descriptor);
    }

    @Override
    public <T extends Definition> void addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents,
            Date lastModified) {
        StringSourceLoader.getInstance().addSource(descriptor, contents, lastModified);
        cleanUpDds.add(descriptor);
    }

    @Override
    public <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(String contents, Class<T> defClass) {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        DefDescriptor<T> desc = loader.createStringSourceDescriptor(null, defClass);
        loader.addSource(desc, contents, new Date());
        cleanUpDds.add(desc);
        return desc;
    }
}
