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
package org.auraframework.impl.source;

import java.util.*;

import org.auraframework.system.DescriptorMatcher;

import com.google.common.collect.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.*;

public class StringSourceLoader implements SourceLoader{
    private static StringSourceLoader instance = null;
    public static final Set<String> PREFIXES = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX);
    public static final Set<DefType> DEFTYPES = EnumSet.of(DefType.COMPONENT, DefType.INTERFACE, DefType.EVENT);
    public static final String NAMESPACE = "string";
    public static final String NAME = "thing";

    public final Map<DefDescriptor<?>, Source<?>> sources = Maps.newHashMap();

    public static int counter = 0;

    private StringSourceLoader(){

    }
    public static StringSourceLoader getInstance(){
        synchronized(StringSourceLoader.class){
            if(instance == null){
                instance = new StringSourceLoader();
            }
        }
        return instance;
    }

    public synchronized final <T extends Definition> DefDescriptor<T> addSource(String contents, Class<T> defClass, Date lastModified){
        return addSource(null, contents, defClass, lastModified);
    }

    public synchronized final <T extends Definition> DefDescriptor<T> addSource(String name, String contents, Class<T> defClass, Date lastModified){
        if (name == null || name.isEmpty()) {
            name = NAME + counter++;
        }
        DefDescriptor<T> descriptor = Aura.getDefinitionService().getDefDescriptor(String.format("%s://%s:%s", DefDescriptor.MARKUP_PREFIX, NAMESPACE, name), defClass);
        Source<T> source = new StringSource<T>(descriptor, contents, descriptor.getQualifiedName(), Format.XML, lastModified.getTime());
        sources.put(descriptor, source);
        return descriptor;
    }

    public synchronized final void removeSource(DefDescriptor<?> descriptor){
        sources.remove(descriptor);
    }

    @Override
    public synchronized Set<DefDescriptor<?>> find(DescriptorMatcher matcher) {
        Set<DefDescriptor<?>> ret = Sets.newHashSet();

        // Since we only have one namespace, we can easily exclude if we don't match.
        if (!matcher.matchNamespace(NAMESPACE)) {
            return ret;
        }
        for(DefDescriptor<?> desc : sources.keySet()){
            if (matcher.matchPrefix(desc.getPrefix()) && matcher.matchName(desc.getName())) {
                ret.add(desc);
            }
        }

        return ret;
    }

    @SuppressWarnings("unchecked")
    @Override
    public synchronized <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix, String namespace) {
        Set<DefDescriptor<T>> ret = Sets.newHashSet();

        for(DefDescriptor<?> desc : sources.keySet()){
            if(desc.getDefType().getPrimaryInterface() == primaryInterface && desc.getPrefix().equals(prefix) && desc.getNamespace().equals(namespace)){
                ret.add((DefDescriptor<T>)desc);
            }
        }
        return ret;
    }

    @Override
    public Set<DefType> getDefTypes() {
        return DEFTYPES;
    }

    @Override
    public Set<String> getNamespaces() {
        return Sets.newHashSet(NAMESPACE);
    }

    @Override
    public Set<String> getPrefixes() {
        return PREFIXES;
    }

    @SuppressWarnings("unchecked")
    @Override
    public synchronized <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        Source<D> ret = (Source<D>)sources.get(descriptor);
        return ret;
    }
}
