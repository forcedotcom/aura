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
package org.auraframework.impl.root.intf;

import java.io.IOException;
import java.util.*;

import com.google.common.collect.Lists;

import org.auraframework.def.*;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * The definition of an interface. Holds all information about a given type of interface. InterfaceDefs are immutable
 * singletons per type. Once they are created, they can only be replaced, never changed.
 */
public final class InterfaceDefImpl extends RootDefinitionImpl<InterfaceDef> implements InterfaceDef {

    /**
     */
    private static final long serialVersionUID = 2253697052585693264L;
    private final Set<DefDescriptor<InterfaceDef>> extendsDescriptors;
    private final Map<String, RegisterEventDef> events;
    private final int hashCode;

    protected InterfaceDefImpl(Builder builder) {
        super(builder);

        this.extendsDescriptors = AuraUtil.immutableSet(builder.extendsDescriptors);
        this.events = AuraUtil.immutableMap(builder.events);
        this.hashCode = AuraUtil.hashCode(super.hashCode(), extendsDescriptors, events);
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (getDescriptor() == null) {
            throw new InvalidDefinitionException("Descriptor cannot be null for InterfaceDef", getLocation());
        }

        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateDefinition();
            if (events.containsKey(att.getName())) {
                throw new InvalidDefinitionException(String.format("Cannot define an attribute and register an event with the same name: %s", att.getName()), getLocation());
            }
        }

        for (RegisterEventDef reg : this.events.values()) {
            reg.validateDefinition();
        }

    }

    /**
     * quick pass to ensure everything this extends and registers exists
     * TODO: lots of logic around making sure this doesn't clash with what it extends #W-689596
     * @throws QuickFixException
     */
    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
        for (DefDescriptor<InterfaceDef> extended : extendsDescriptors) {
            InterfaceDef def = extended.getDef();
            if (def == null) {
                throw new DefinitionNotFoundException(extended, getLocation());
            }
            if (extended.equals(descriptor)) {
                throw new InvalidDefinitionException(String.format("%s cannot extend itself", getDescriptor()), getLocation());
            }
        }

        // make sure the registered events actually exist
        for (RegisterEventDef reg : this.events.values()) {
            reg.validateReferences();
        }

        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateReferences();
        }
    }

    /**
     * Recursively adds the Descriptors of all RootDefs in this InterfaceDef's children to the provided set.
     * The set may then be used to analyze freshness of all of those types to see if any of them should be recompiled
     * from source.
     *
     * @param dependencies A Set that this method will append RootDescriptors to for every RootDef that this InterfaceDef requires
     * @throws QuickFixException
     */
    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        dependencies.addAll(extendsDescriptors);
        for (RegisterEventDef register : this.events.values()) {
            register.appendDependencies(dependencies);
        }

        if (providerDescriptors != null){
            dependencies.addAll(providerDescriptors);
        }
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws org.auraframework.throwable.quickfix.QuickFixException {
        Map<String, RegisterEventDef> ret = new LinkedHashMap<String, RegisterEventDef>();
        for(DefDescriptor<InterfaceDef> extendsDescriptor : extendsDescriptors){
            InterfaceDef extendsDef = extendsDescriptor.getDef();
            ret.putAll(extendsDef.getRegisterEventDefs());
            ret.putAll(events);
        }

        if (ret.isEmpty()) {
            return events;
        } else {
            return Collections.unmodifiableMap(ret);
        }
    }

    /**
     * @return all the attributes for this interface, including those inherited from a super interface
     * @throws QuickFixException
     */
    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {

        Map<DefDescriptor<AttributeDef>, AttributeDef> ret = new LinkedHashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        for(DefDescriptor<InterfaceDef> extendsDescriptor : extendsDescriptors){
            InterfaceDef extendsDef = extendsDescriptor.getDef();
            ret.putAll(extendsDef.getAttributeDefs());
            ret.putAll(attributeDefs);
        }

        if(ret.isEmpty()){
            return attributeDefs;
        }else{
            return Collections.unmodifiableMap(ret);
        }
    }

    @Override
    public Set<DefDescriptor<InterfaceDef>> getExtendsDescriptors() {
        return extendsDescriptors;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof InterfaceDefImpl) {
            InterfaceDefImpl other = (InterfaceDefImpl)obj;

            // TODO: factor attributeDefs into this? #W-689622
            return getDescriptor().equals(other.getDescriptor())
                    && extendsDescriptors.equals(other.extendsDescriptors)
                    && events.equals(other.events)
                    && getLocation().equals(other.getLocation());
        }

        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    /**
     * Used by Json.serialize
     */
    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("attributes", attributeDefs);
        json.writeMapEntry("isAbstract", true);
        json.writeMapEnd();
    }

    public static class Builder extends RootDefinitionImpl.Builder<InterfaceDef> {

        public Builder(){
            super(InterfaceDef.class);
        }

        public Set<DefDescriptor<InterfaceDef>> extendsDescriptors;
        public Map<String, RegisterEventDef> events;

        @Override
        public InterfaceDefImpl build() {
            return new InterfaceDefImpl(this);
        }
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        switch(other.getDefType()){
            case INTERFACE:
                if(descriptor.equals(other)){
                    return true;
                }

                for(DefDescriptor<InterfaceDef> intf : extendsDescriptors){
                    if(intf.equals(other) || intf.getDef().isInstanceOf(other)){
                      return true;
                    }
                }
                return false;
            default:
                return false;
        }
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        return ret;
    }

}
