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
package org.auraframework.impl.root.library;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.LinkedListMultimap;
import com.google.common.collect.ListMultimap;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class LibraryDefImpl extends RootDefinitionImpl<LibraryDef> implements LibraryDef {
    private static final long serialVersionUID = 610875326950592992L;
    private final int hashCode;

    private List<IncludeDefRef> includeRefs;

    protected LibraryDefImpl(Builder builder) {
        super(builder);
        this.includeRefs = builder.includes;
        this.hashCode = AuraUtil.hashCode(super.hashCode(), includeRefs);
    }

    @Override
    public List<IncludeDefRef> getIncludes() {
        return includeRefs;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapKey("includes");
        json.writeMapBegin();
        for (IncludeDefRef include : includeRefs) {
            json.writeMapEntry(include.getName(), include);
        }
        json.writeMapEnd();
        json.writeMapEnd();
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        if (includeRefs == null || includeRefs.isEmpty()) {
            throw new InvalidDefinitionException("aura:library must contain at least one aura:include attribute",
                    getLocation());
        }

        Set<String> names = Sets.newHashSet();
        for (IncludeDefRef include : includeRefs) {
            if (!names.add(include.getName())) {
                throw new InvalidDefinitionException(String.format("%s with duplicate name found in library: %s",
                        IncludeDefRefHandler.TAG, include.getName()), getLocation());
            }
        }
        includeRefs = orderByDependencies(includeRefs); // Will throw if impossible to order due to invalid dependency
                                                        // tree.
    }

    @Override
    public void appendDependencies(java.util.Set<org.auraframework.def.DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        for (IncludeDefRef includeRef : includeRefs) {
            includeRef.appendDependencies(dependencies);
        }
    };

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof LibraryDefImpl) {
            LibraryDefImpl other = (LibraryDefImpl) obj;
            return getDescriptor().equals(other.getDescriptor());
        }

        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    /**
     * @see RootDefinition#getRegisterEventDefs()
     */
    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() {
        return null;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other)
            throws QuickFixException {
        return false;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        return ret;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs()
            throws QuickFixException {
        return attributeDefs;
    }

    /**
     * Orders the includes so that the resources with dependencies are loaded after the files they depend on.
     * 
     * @throws InvalidDefinitionException
     */
    private List<IncludeDefRef> orderByDependencies(List<IncludeDefRef> unordered) throws InvalidDefinitionException {
        List<IncludeDefRef> ordered = Lists.newLinkedList();
        Set<DefDescriptor<IncludeDef>> placed = Sets.newHashSet();
        ListMultimap<DefDescriptor<IncludeDef>, IncludeDefRef> dependantsMap = LinkedListMultimap.create();
        List<IncludeDefRef> step = Lists.newLinkedList();

        for (IncludeDefRef include : unordered) {
            List<DefDescriptor<IncludeDef>> imports = Lists.newLinkedList();

            if (include.getImports() != null) {
                for (DefDescriptor<IncludeDef> imported : include.getImports()) {
                    // We can only order local includes here, so ignore external imports
                    if (descriptor.equals(imported.getBundle())) {
                        imports.add(imported);
                    }
                }
            }

            if (imports.isEmpty()) {
                ordered.add(include);
                placed.add(include.getIncludeDescriptor());
                step.add(include);
            } else {
                for (DefDescriptor<IncludeDef> imported : imports) {
                    dependantsMap.put(imported, include);
                }
            }
        }

        while (!step.isEmpty()) {
            List<IncludeDefRef> currentStep = step;
            step = Lists.newLinkedList();

            for (IncludeDefRef currentInclude : currentStep) {
                for (IncludeDefRef nextInclude : dependantsMap.get(currentInclude.getIncludeDescriptor())) {
                    boolean isSatisfied = true;
                    for (DefDescriptor<IncludeDef> imported : nextInclude.getImports()) {
                        if (!placed.contains(imported)) {
                            isSatisfied = false;
                            break;
                        }
                    }

                    if (isSatisfied) {
                        ordered.add(nextInclude);
                        placed.add(nextInclude.getIncludeDescriptor());
                        step.add(nextInclude);
                    }
                }
            }
        }

        if (ordered.size() != unordered.size()) {
            throw new InvalidDefinitionException(
                    "aura:library: Unable to order include statements by dependency tree.",
                    getLocation());
        }

        return ordered;

    }

    public static class Builder extends RootDefinitionImpl.Builder<LibraryDef> {

        private List<IncludeDefRef> includes;

        public Builder() {
            super(LibraryDef.class);
        }

        public void setIncludes(List<IncludeDefRef> includes) {
            this.includes = includes;
        }

        /**
         * @throws QuickFixException
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public LibraryDefImpl build() {
            // Lookup associated documentation in present:
            DefDescriptor<DocumentationDef> documentationDescriptor = DefDescriptorImpl.getAssociateDescriptor(
                    getDescriptor(), DocumentationDef.class, DefDescriptor.MARKUP_PREFIX
                    );

            if (documentationDescriptor.exists()) {
                setDocumentation(documentationDescriptor.getQualifiedName());
            }
            return new LibraryDefImpl(this);
        }
    }
}