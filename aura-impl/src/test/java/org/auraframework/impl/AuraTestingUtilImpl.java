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
import org.auraframework.system.SourceLoader;
import org.auraframework.test.AuraTestingUtil;

import com.google.common.collect.Sets;


public class AuraTestingUtilImpl implements AuraTestingUtil{
    private DefUtil defUtil;

    public AuraTestingUtilImpl(){
        defUtil = new DefUtil();
    }
    @Override
    public void setUp() {
        //Do nothing
    }
    @Override
    public void tearDown(){
        defUtil.tearDown();
    }

    @Override
    public File getAuraJavascriptSourceDirectory(){
        return AuraImplFiles.AuraJavascriptSourceDirectory.asFile();
    }

    @Override
    public Set<SourceLoader> getAdditionalLoaders(){
        return defUtil.getAdditionalLoaders();
    }

    @Override
    public Source<?> getSource(DefDescriptor<?> descriptor){
        return defUtil.getSource(descriptor);
    }

    @Override
    public <T extends Definition> DefDescriptor<T> addSource(String contents, Class<T> defClass){
        return addSource(null, contents, defClass);
    }

    @Override
    public <T extends Definition> DefDescriptor<T> addSource(String name, String contents, Class<T> defClass){
        return defUtil.addSource(name, contents, defClass, new Date());
    }

    @Override
    public <T extends Definition> DefDescriptor<T> addSource(String contents, Class<T> defClass, Date lastModified){
        return defUtil.addSource(null, contents, defClass, lastModified);
    }
    @Override
    public <T extends Definition> DefDescriptor<T> addSource(String name,String contents, Class<T> defClass, Date lastModified){
        return defUtil.addSource(name, contents, defClass, lastModified);
    }
    /**
     * Utility class to handle definitions.
     *
     *
     */
    private class DefUtil{
        private StringSourceLoader stringSourceLoader = StringSourceLoader.getInstance();
        private Set<SourceLoader> loaders = Sets.<SourceLoader>newHashSet(stringSourceLoader);
        private Set<DefDescriptor<?>> cleanUpDds;

        public void tearDown(){
            if (cleanUpDds != null){
                for (DefDescriptor<?> dd : cleanUpDds){
                    removeSource(dd);
                }
            }
        }
        private Set<SourceLoader> getAdditionalLoaders(){
            return loaders;
        }
        private void removeSource(DefDescriptor<?> descriptor){
            stringSourceLoader.removeSource(descriptor);
        }

        private Source<?> getSource(DefDescriptor<?> descriptor){
            return Aura.getContextService().getCurrentContext().getDefRegistry().getSource(descriptor);
        }
        private <T extends Definition> DefDescriptor<T> addSource(String name, String contents, Class<T> defClass, Date lastModified){
            DefDescriptor<T> dd = stringSourceLoader.addSource(name, contents, defClass, lastModified);
            if (cleanUpDds == null)
                cleanUpDds = Sets.newHashSet();
            cleanUpDds.add(dd);
            return dd;
        }
    }

}
