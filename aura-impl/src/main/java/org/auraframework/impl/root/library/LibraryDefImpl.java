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
    private Set<DefDescriptor<IncludeDef>> externalIncludes;

    protected LibraryDefImpl(Builder builder) {
        super(builder);
        this.includeRefs = builder.includes;
        this.hashCode = AuraUtil.hashCode(super.hashCode(), includeRefs);
        externalIncludes = Sets.newHashSet();
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

        if (!externalIncludes.isEmpty()) {
            json.writeMapKey("externalDependencies");
            json.writeArrayBegin();
            for (DefDescriptor<IncludeDef> include : externalIncludes) {
                json.writeArrayEntry(include.getBundle().getDescriptorName() + ":" + include.getName());
            }
            json.writeArrayEnd();
        }
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
            List<DefDescriptor<IncludeDef>> imports = include.getImports();
            if (imports != null) {
                for (DefDescriptor<IncludeDef> imported : imports) {
                    if (!descriptor.equals(imported.getBundle())) {
                        externalIncludes.add(imported);
                    }
                }
            }
        }
        includeRefs = orderByDependencies(includeRefs); // Will throw if impossible to order due to invalid dependency
                                                        // tree.
    }

    @Override
    public void validateReferences() throws QuickFixException {
        for (IncludeDefRef include : includeRefs) {
            include.validateDefinition();
            include.validateReferences();
        }
    }

    @Override
    public void appendDependencies(java.util.Set<DefDescriptor<?>> dependencies) {
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
     * @throws QuickFixException
     * @throws DefinitionNotFoundException Looks at an include an extracts external dependency libraries.
     * @throws QuickFixException
     * @throws private List<LibraryDef> extractExternalDependencies(IncludeDef includeDef) throws QuickFixException {
     *             List<LibraryDef> dependencies = Lists.newLinkedList(); if (includeDef.getImports() == null ||
     *             includeDef.getImports().isEmpty()) { return dependencies; }
     * 
     *             for (String importName : includeDef.getImports()) { String[] tokens = importName.split(":"); if
     *             (tokens.length == 3) { String dependencyName = tokens[0] + ":" + tokens[1];
     *             dependencies.add(Aura.getDefinitionService().getDefinition(dependencyName, LibraryDef.class)); } else
     *             if (tokens.length != 1) { throw new InvalidDefinitionException("Invalid import file name: " +
     *             importName, getLocation()); } } return dependencies; }
     */

    /**
     * Orders the includes so that the resources with dependencies are loaded after the files they depend on.
     * 
     * @throws InvalidDefinitionException
     */
    private List<IncludeDefRef> orderByDependencies(List<IncludeDefRef> unordered) throws InvalidDefinitionException {
        List<IncludeDefRef> ordered = Lists.newLinkedList();
        Set<DefDescriptor<IncludeDef>> resolved = Sets.newHashSet();
        ListMultimap<DefDescriptor<IncludeDef>, IncludeDefRef> dependantsMap = LinkedListMultimap.create();

        // List of dependencies resolved in a resolution pass:
        List<IncludeDefRef> pass = Lists.newLinkedList();

        for (IncludeDefRef include : unordered) {
            List<DefDescriptor<IncludeDef>> imports = Lists.newLinkedList();

            // Filter out local imports:
            if (include.getImports() != null) {
                for (DefDescriptor<IncludeDef> imported : include.getImports()) {
                    if (descriptor.equals(imported.getBundle())) {
                        imports.add(imported);
                    }
                }
            }

            if (imports.isEmpty()) {
                ordered.add(include);
                resolved.add(include.getIncludeDescriptor());
                pass.add(include);
            } else {
                for (DefDescriptor<IncludeDef> imported : imports) {
                    dependantsMap.put(imported, include);
                }
            }
        }

        // Until there are no dependencies resolved in a pass:
        while (!pass.isEmpty()) {
            List<IncludeDefRef> previousPass = pass;
            pass = Lists.newLinkedList();

            // For each include that was resolved in the previous pass:
            for (IncludeDefRef previousPassInclude : previousPass) {

                // Find all things that depend on this include:
                for (IncludeDefRef requiredCurrent : dependantsMap.get(previousPassInclude.getIncludeDescriptor())) {
                    // Skip includes that depend on this include from the previous pass that are already resolved:
                    if (resolved.contains(requiredCurrent.getIncludeDescriptor())) {
                        break;
                    }

                    // Check to see if in this pass, the include's dependencies can be resolved:
                    boolean isSatisfied = true;
                    for (DefDescriptor<IncludeDef> imported : requiredCurrent.getImports()) {
                        if (descriptor.equals(imported.getBundle()) && !resolved.contains(imported)) {
                            isSatisfied = false;
                            break;
                        }
                    }

                    // If resolved, add this dependency to the next pass as something that depends on this now
                    // might become resolvable:
                    if (isSatisfied) {
                        ordered.add(requiredCurrent);
                        resolved.add(requiredCurrent.getIncludeDescriptor());
                        pass.add(requiredCurrent);
                    }
                }
            }
        }

        if (ordered.size() != unordered.size()) {
            throw new InvalidDefinitionException(
                    "aura:library: Unable to order include statements by dependency tree.", getLocation());
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
