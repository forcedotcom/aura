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
package org.auraframework.impl.css;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.auraframework.css.MutableThemeList;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.Hash;

import com.google.common.base.Optional;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterators;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Table;

/**
 * Implementation of {@link MutableThemeList}.
 */
public final class ThemeListImpl implements MutableThemeList {
    private final List<DefDescriptor<ThemeDef>> themes = Lists.newArrayList();
    private final Table<String, DefDescriptor<ThemeDef>, String> dynamicVars = HashBasedTable.create();

    public ThemeListImpl() {
    }

    public ThemeListImpl(Iterable<DefDescriptor<ThemeDef>> themeDescriptors) throws QuickFixException {
        appendAll(themeDescriptors);
    }

    @Override
    public int size() {
        return themes.size();
    }

    @Override
    public boolean isEmpty() {
        return themes.isEmpty();
    }

    @Override
    public DefDescriptor<ThemeDef> get(int index) {
        return themes.get(index);
    }

    @Override
    public Optional<Object> getValue(String name) throws QuickFixException {
        for (DefDescriptor<ThemeDef> theme : Lists.reverse(themes)) {
            ThemeDef def = theme.getDef();

            Optional<Object> value = def.getVar(name);
            if (value.isPresent()) {
                return value;
            }

            if (def.getMapProvider() != null) {
                value = Optional.<Object>fromNullable(dynamicVars.get(name, theme));
            }
            if (value.isPresent()) {
                return value;
            }
        }

        return Optional.absent();
    }

    @Override
    public Iterator<DefDescriptor<ThemeDef>> iterator() {
        return Iterators.unmodifiableIterator(themes.iterator());
    }

    @Override
    public List<DefDescriptor<ThemeDef>> orderedForEvaluation() {
        return ImmutableList.copyOf(themes).reverse();
    }

    @Override
    public Map<String, String> activeDynamicVars() {
        Map<String, String> map = Maps.newHashMap();

        // no need to consult #orderedForEvaluation because we are using a map
        for (DefDescriptor<ThemeDef> theme : themes) {
            map.putAll(dynamicVars.column(theme));
        }
        return map;
    }

    @Override
    public Optional<String> getThemeDescriptorsUid() {
        if (themes.isEmpty()) {
            return Optional.absent();
        }

        Hash.StringBuilder builder = new Hash.StringBuilder();
        for (DefDescriptor<ThemeDef> theme : themes) {
            builder.addString(theme.getQualifiedName());
        }
        return Optional.of(builder.build().toString());
    }

    @Override
    public Optional<String> getActiveDynamicVarsUid() {
        if (dynamicVars.isEmpty()) {
            return Optional.absent();
        }

        Map<String, String> activeDynamicVars = activeDynamicVars();

        Hash.StringBuilder builder = new Hash.StringBuilder();
        for (Entry<String, String> entry : activeDynamicVars.entrySet()) {
            builder.addString(entry.getKey());
            builder.addString(entry.getValue());
        }
        return Optional.of(builder.build().toString());
    }

    @Override
    public boolean hasDynamicVars() {
        return !dynamicVars.isEmpty();
    }

    @Override
    public ThemeListImpl prepend(DefDescriptor<ThemeDef> themeDescriptor) throws QuickFixException {
        checkNotNull(themeDescriptor, "themeDescriptor cannot be null");
        DefDescriptor<ThemeDef> realDescriptor = themeDescriptor.getDef().getConcreteDescriptor();
        themes.add(0, realDescriptor);
        processNewTheme(realDescriptor);
        return this;
    }

    @Override
    public ThemeListImpl prependAll(Iterable<DefDescriptor<ThemeDef>> themeDescriptors) throws QuickFixException {
        checkNotNull(themeDescriptors, "themeDescriptors cannot be null");
        List<DefDescriptor<ThemeDef>> list = Lists.newArrayList();

        for (DefDescriptor<ThemeDef> themeDescriptor : themeDescriptors) {
            DefDescriptor<ThemeDef> realDescriptor = themeDescriptor.getDef().getConcreteDescriptor();
            list.add(realDescriptor);
            processNewTheme(realDescriptor);
        }

        themes.addAll(0, list);
        return this;
    }

    @Override
    public ThemeListImpl append(DefDescriptor<ThemeDef> themeDescriptor) throws QuickFixException {
        checkNotNull(themeDescriptor, "themeDescriptor cannot be null");
        DefDescriptor<ThemeDef> realDescriptor = themeDescriptor.getDef().getConcreteDescriptor();
        themes.add(realDescriptor);
        processNewTheme(realDescriptor);
        return this;
    }

    @Override
    public MutableThemeList appendAll(Iterable<DefDescriptor<ThemeDef>> themeDescriptors) throws QuickFixException {
        checkNotNull(themeDescriptors, "themeDescriptors cannot be null");
        List<DefDescriptor<ThemeDef>> list = Lists.newArrayList();

        for (DefDescriptor<ThemeDef> themeDescriptor : themeDescriptors) {
            DefDescriptor<ThemeDef> realDescriptor = themeDescriptor.getDef().getConcreteDescriptor();
            list.add(realDescriptor);
            processNewTheme(realDescriptor);
        }

        themes.addAll(list);
        return this;
    }

    private void processNewTheme(DefDescriptor<ThemeDef> themeDescriptor) throws QuickFixException {
        ThemeDef def = themeDescriptor.getDef();
        if (def.getMapProvider() != null) {
            Map<String, String> map = def.getMapProvider().getDef().provide();
            for (Entry<String, String> entry : map.entrySet()) {
                dynamicVars.put(entry.getKey(), themeDescriptor, entry.getValue());
            }
        }
    }
}
