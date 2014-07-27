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
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.ImportDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidReferenceException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class ImportDefHandlerImpl extends DefinitionImpl<LibraryDef> implements ImportDef {
   private static final long serialVersionUID = 8916829297107001915L;
   private final DefDescriptor<? extends RootDefinition> parentDescriptor;
   private final String library;
   private final String property;

   protected ImportDefHandlerImpl(Builder builder) {
       super(builder);
       this.parentDescriptor = builder.parentDescriptor;
       this.library = builder.library;
       this.property = builder.property;
   }
   
   @Override
    public String getLibraryName() {
        return this.library;
    }

   @Override
   public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
       if (descriptor != null) {
           dependencies.add(descriptor);
       }
   }

   @Override
   public void validateDefinition() throws QuickFixException {
       if (library == null) {
           throw new InvalidDefinitionException("aura:import must specify module=\"…\"", getLocation());
       }
       
       if (property == null) {
           throw new InvalidDefinitionException("aura:import must specify property=\"…\"", getLocation());
       }
   }

   @Override
   public void validateReferences() throws QuickFixException {
       if (library == null) {
           throw new InvalidReferenceException("aura:import has invalid module: null", getLocation());
       } 
       
       assert(parentDescriptor != null);
       // TODO: convert text to module def and validate 
       // Aura.getDefinitionService().getDefRegistry().assertAccess(parentDescriptor, module);
   }

   @Override
   public void serialize(Json json) throws IOException {
       json.writeMapBegin();
       json.writeMapEntry("name", library);
       json.writeMapEntry("property", property);
       json.writeMapEnd();
   }

   public static class Builder extends DefinitionImpl.RefBuilderImpl<LibraryDef, ImportDefHandlerImpl> {

       public Builder() {
           super(LibraryDef.class);
       }

       private DefDescriptor<? extends RootDefinition> parentDescriptor;
       private String library;
       private String property;

       @Override
       public ImportDefHandlerImpl build() {
           return new ImportDefHandlerImpl(this);
       }

       public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
           this.parentDescriptor = parentDescriptor;
           return this;
       }

       public Builder setModule(String module) {
           this.library = module;
           return this;
       }
       
       public Builder setProperty(String property) {
           this.property = property;
           return this;
       }
   }
}
