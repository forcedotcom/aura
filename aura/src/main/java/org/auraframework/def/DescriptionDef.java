package org.auraframework.def;

public interface DescriptionDef extends Definition {
    @Override
    DefDescriptor<DescriptionDef> getDescriptor();
    
    String getBody();
    String getId();
}
