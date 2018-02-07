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
package org.auraframework.impl;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.builder.ApplicationDefBuilder;
import org.auraframework.builder.CacheBuilder;
import org.auraframework.builder.ComponentDefBuilder;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.builder.FlavoredStyleDefBuilder;
import org.auraframework.builder.ModuleDefRefBuilder;
import org.auraframework.builder.StyleDefBuilder;
import org.auraframework.builder.TokensDefBuilder;
import org.auraframework.impl.cache.CacheImpl;
import org.auraframework.impl.css.flavor.FlavoredStyleDefImpl;
import org.auraframework.impl.css.style.StyleDefImpl;
import org.auraframework.impl.css.token.TokensDefImpl;
import org.auraframework.impl.root.application.ApplicationDefImpl;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.root.component.ModuleDefRefImpl;
import org.auraframework.service.BuilderService;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class BuilderServiceImpl implements BuilderService {
    private static final long serialVersionUID = 5092951086123399013L;

    @Override
    public ApplicationDefBuilder getApplicationDefBuilder() {
        return new ApplicationDefImpl.Builder();
    }

    @Override
    public ComponentDefBuilder getComponentDefBuilder() {
        return new ComponentDefImpl.Builder();
    }

    @Override
    public ComponentDefRefBuilder getComponentDefRefBuilder() {
        return new ComponentDefRefImpl.Builder();
    }

    @Override
    public ModuleDefRefBuilder getModuleDefRefBuilder() {
        return new ModuleDefRefImpl.Builder();
    }

    @Override
    public StyleDefBuilder getStyleDefBuilder() {
        return new StyleDefImpl.Builder();
    }

    @Override
    public FlavoredStyleDefBuilder getFlavoredStyleDefBuilder() {
        return new FlavoredStyleDefImpl.Builder();
    }

    @Override
    public TokensDefBuilder getTokensDefBuilder() {
        return new TokensDefImpl.Builder();
    }

    @Override
    public <K, V> CacheBuilder<K, V> getCacheBuilder() throws QuickFixException {
        return new CacheImpl.Builder<>();
    }
}
