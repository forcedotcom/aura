package org.auraframework.impl.design;

import java.io.IOException;
import java.util.Set;

import org.auraframework.def.*;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class AttributeDesignDefImpl implements AttributeDesignDef {

    @Override
    public void validateDefinition() throws QuickFixException {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void validateReferences() throws QuickFixException {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void markValid() {
        // TODO Auto-generated method stub
        
    }

    @Override
    public boolean isValid() {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public String getName() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Location getLocation() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Visibility getVisibility() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DefinitionAccess getAccess() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DefDescriptor<? extends Definition> getDescriptor() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        // TODO Auto-generated method stub
        
    }

    @Override
    public String getDescription() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public String getAPIVersion() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public String getOwnHash() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub
        
    }

}
