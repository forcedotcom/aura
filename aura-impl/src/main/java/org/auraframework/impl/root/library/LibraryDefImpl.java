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
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
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
    
    private List<IncludeDef> includes;
    private List<LibraryDef> externalLibraries;

    protected LibraryDefImpl(Builder builder) {
        super(builder);
        this.hashCode = super.hashCode();
        this.includes = builder.includes; 
        this.externalLibraries = Lists.newLinkedList();
    }

    @Override
    public List<IncludeDef> getIncludes() {
		return includes;
	}
    
    @Override
    public List<LibraryDef> getExternalDependencies() {
    	return externalLibraries;
    }

	@Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapKey("includes"); 
        json.writeMapBegin();
        for (IncludeDef include : includes) {
            include.serialize(json);
        }
        json.writeMapEnd();
        
        if (!externalLibraries.isEmpty()) {
        	json.writeMapKey("externalDependencies");
        	json.writeArrayBegin();
        	Iterator<LibraryDef> iterator = externalLibraries.iterator();
	        while (iterator.hasNext()) {
	        	LibraryDef library = iterator.next();
	        	DefDescriptor<LibraryDef> libraryDescriptor = library.getDescriptor();
	        	json.writeString(libraryDescriptor.getNamespace() 
        			+ ":" + libraryDescriptor.getName() 
        			+ ":" + library.getName()
    			);
	        	
	        	if (iterator.hasNext()) {
	        		json.writeComma();
	        	}
	        }
	        json.writeArrayEnd();
        }
        json.writeMapEnd();
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        if (includes.isEmpty()) {
            throw new InvalidDefinitionException("aura:library must contain at least one aura:include attribute", getLocation());
        }
        
        for (IncludeDef includeDef : includes) {
        	externalLibraries.addAll(extractExternalDependencies(includeDef));
        }
        
        for (LibraryDef externalLibrary : externalLibraries) {
        	externalLibrary.validateDefinition();
        }
        
        includes = orderByDependencies(includes); // Will throw if impossible to order due to invalid dependency tree.
        
        for(IncludeDef includeDef : includes) {
            includeDef.validateDefinition();
        }
    }
    
    @Override
    public void appendDependencies(java.util.Set<org.auraframework.def.DefDescriptor<?>> dependencies) {
    	super.appendDependencies(dependencies);
        for (LibraryDef externalLibrary : externalLibraries) {
        	dependencies.add(externalLibrary.getDescriptor());
        }
    };

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof EventDefImpl) {
            EventDefImpl other = (EventDefImpl) obj;
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
     * @throws DefinitionNotFoundException 
     * Looks at an include an extracts external dependency libraries.
     * @throws QuickFixException 
     * @throws  
     */
    private List<LibraryDef> extractExternalDependencies(IncludeDef includeDef) throws QuickFixException {
    	List<LibraryDef> dependencies = Lists.newLinkedList();
    	if (includeDef.getImports() == null || includeDef.getImports().isEmpty()) {
    		return dependencies;
    	}
    	
    	for (String importName : includeDef.getImports()) {
    		String[] tokens = importName.split(":");
    		if (tokens.length == 3) {
    			String dependencyName = tokens[0] + ":" + tokens[1];
				dependencies.add(Aura.getDefinitionService().getDefinition(dependencyName, LibraryDef.class));
    		} else if (tokens.length != 1) {
    			throw new InvalidDefinitionException("Invalid import file name: " + importName, getLocation());
    		}
    	}
    	return dependencies;
    }
    
    /**
     * Orders the includes so that the resources with dependencies are loaded after the files they depend on.
     * @throws InvalidDefinitionException 
     */
    private List<IncludeDef> orderByDependencies(List<IncludeDef> unordered) throws InvalidDefinitionException {
    	List<IncludeDef> ordered = Lists.newLinkedList();
    	Set<String> resolved = Sets.newHashSet();
    	ListMultimap<String, IncludeDef> dependantsMap = LinkedListMultimap.create();
    	
    	// List of dependencies resolved in a resolution pass:
    	List<IncludeDef> pass = Lists.newLinkedList();
    	
    	for (IncludeDef include: unordered) {
    		List<String> imports = Lists.newLinkedList();
    		
    		// Filter out NON external imports:
    		if (include.getImports() != null) {
    			for (String importName : include.getImports()) {
    				if (importName.split(":").length == 1) {
    					imports.add(importName);
    				}
    			}
    		}
    		
    		if (imports.isEmpty()) {
    			ordered.add(include);
    			resolved.add(include.getLibraryName());
    			pass.add(include);
    		} else {
    			for (String imported : imports) {
    				dependantsMap.put(imported, include);
    			}
    		}
    	}
    	
    	// Until there are no dependencies resolved in a pass:
    	while (!pass.isEmpty()) {
    		List<IncludeDef> previousPass = pass;
    		pass = Lists.newLinkedList();
    		
    		// For each include that was resolved in the previous pass:
    		for (IncludeDef previousPassInclude : previousPass) {
    			
    			// Find all things that depend on this include:
    			for (IncludeDef requiredCurrent : dependantsMap.get(previousPassInclude.getLibraryName())) {
    				// Skip includes that depend on this include from the previous pass that are already resolved:
    				if (resolved.contains(requiredCurrent.getLibraryName())) {
    					break;
    				}
    				
    				// Check to see if in this pass, the include's dependencies can be resolved:
    				boolean isSatisfied = true;
    				for (String imported : requiredCurrent.getImports()) {
    					if (imported.indexOf(":") == -1 && !resolved.contains(imported)) {
    						isSatisfied = false;
    						break;
    					}
    				}
    				
    				// If resolved, add this dependency to the next pass as something that depends on this now
    				// might become resolvable:
    				if (isSatisfied) {
    					ordered.add(requiredCurrent);
    					resolved.add(requiredCurrent.getLibraryName());
    					pass.add(requiredCurrent);
    				}
    			}
    		}
    	}
    	
    	if (ordered.size() != unordered.size()) {
    		throw new InvalidDefinitionException("aura:lbrary: Unable to order include statements by dependency tree.", getLocation());
    	}
    	
    	return ordered;
    	
    }
    
    public static class Builder extends RootDefinitionImpl.Builder<LibraryDef> {
        
        private List<IncludeDef> includes;
        
        public Builder() {
            super(LibraryDef.class);
        }
        
        public void setIncludes(List<IncludeDef> includes) {
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