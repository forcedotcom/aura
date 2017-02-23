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

import java.util.Set;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;

@ServiceComponent
public class StringSourceLoaderController implements Controller {
    @Inject
    private DefinitionService definitionService;

    @Inject
    private StringSourceLoader stringSourceLoader;

    @SuppressWarnings("unchecked")
    @AuraEnabled
    public <D extends Definition, B extends Definition> DefDescriptor<D> createStringSourceDescriptor(
            @Key("namePrefix") String namePrefix,
            @Key("defClass") String defClass,
            @Key("bundleName") String bundleName,
            @Key("bundleDefClass") String bundleDefClass)
            throws ClassNotFoundException {

        DefDescriptor<B> bundleDescriptor = null;
        if (bundleName != null) {
            bundleDescriptor = definitionService.getDefDescriptor(bundleName,
                    (Class<B>) Class.forName(bundleDefClass));
        }
        return stringSourceLoader.createStringSourceDescriptor(namePrefix,
                (Class<D>) Class.forName(defClass), bundleDescriptor);
    }

    @SuppressWarnings("unchecked")
    @AuraEnabled
    public <D extends Definition, B extends Definition> void putSource(
            @Key("name") String name, @Key("defClass") String defClass,
            @Key("bundleName") String bundleName,
            @Key("bundleDefClass") String bundleDefClass,
            @Key("contents") String contents,
            @Key("overwrite") boolean overwrite,
            @Key("access") String access)
            throws ClassNotFoundException {

        DefDescriptor<B> bundleDescriptor = null;
        if (bundleName != null) {
            bundleDescriptor = definitionService.getDefDescriptor(bundleName,
                    (Class<B>) Class.forName(bundleDefClass));
        }
        DefDescriptor<D> descriptor = definitionService.getDefDescriptor(name,
                (Class<D>) Class.forName(defClass), bundleDescriptor);
        stringSourceLoader.putSource(descriptor, contents, overwrite, StringSourceLoader.NamespaceAccess.valueOf(access));
    }

    @SuppressWarnings("unchecked")
    @AuraEnabled
    public <D extends Definition, B extends Definition> void removeSource(
            @Key("name") String name, @Key("defClass") String defClass,
            @Key("bundleName") String bundleName,
            @Key("bundleDefClass") String bundleDefClass) throws ClassNotFoundException {
        DefDescriptor<B> bundleDescriptor = null;
        if (bundleName != null) {
            bundleDescriptor = definitionService.getDefDescriptor(bundleName,
                    (Class<B>) Class.forName(bundleDefClass));
        }
        DefDescriptor<D> descriptor = definitionService.getDefDescriptor(name,
                (Class<D>) Class.forName(defClass), bundleDescriptor);
        stringSourceLoader.removeSource(descriptor);
    }

    @AuraEnabled
    public Set<String> getNamespaces() {
        return stringSourceLoader.getNamespaces();
    }

    @AuraEnabled
    public Set<String> getPrefixes() {
        return stringSourceLoader.getPrefixes();
    }

    @AuraEnabled
    public Set<DefType> getDefTypes() {
        return stringSourceLoader.getDefTypes();
    }

    @AuraEnabled
    public Set<DefDescriptor<?>> findForDescriptorFilter(
            @Key("descriptorFilter") DescriptorFilter descriptorFilter) {
        return stringSourceLoader.find(descriptorFilter);
    }

    @AuraEnabled
    boolean isInternalNamespace(@Key("namespace") String namespace) {
        return stringSourceLoader.isInternalNamespace(namespace);
    }
}
