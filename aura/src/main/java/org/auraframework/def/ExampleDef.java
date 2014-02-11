package org.auraframework.def;

public interface ExampleDef extends Definition {
    @Override
    DefDescriptor<ExampleDef> getDescriptor();
    
    String getName();
    String getLabel();
    String getDescription();
    
    String getMarkup();
}
