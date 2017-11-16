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
package org.auraframework.impl.adapter;

import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.adapter.GlobalValueProviderAdapter;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LocalizationService;

import com.google.common.collect.Sets;

/**
 */
@ServiceComponent
public class GlobalValueProviderAdapterImpl implements GlobalValueProviderAdapter {

    @Inject
    private LocalizationAdapter localizationAdapter;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private ContextService contextService;

    @Inject
    private LocalizationService localizationService;
    
    @Override
    public List<GlobalValueProvider> createValueProviders() {
        List<GlobalValueProvider> l = new LinkedList<>();

        // $Label.Section.Key
        l.add(new LabelValueProvider(localizationAdapter, definitionService));

        // $Locale
        l.add(new LocaleValueProvider(localizationService, localizationAdapter, definitionService));

        // $Browser
        l.add(new BrowserValueProvider(contextService));
        
        // $Global
        l.add(new ContextValueProvider(contextService));
        
        return l;
    }

    @Override
    public Set<ValueProviderType> getKeys() {
        return Sets.<ValueProviderType>newHashSet(
               AuraValueProviderType.LABEL, 
               AuraValueProviderType.LOCALE, 
               AuraValueProviderType.BROWSER, 
               AuraValueProviderType.GLOBAL);
    }
}
