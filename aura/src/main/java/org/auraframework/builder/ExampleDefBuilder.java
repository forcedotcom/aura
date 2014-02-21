package org.auraframework.builder;

import org.auraframework.def.ExampleDef;

public interface ExampleDefBuilder extends DefBuilder<ExampleDef, ExampleDef> {
    ExampleDefBuilder setBody(Object body);
    
    ExampleDefBuilder setName(String name);

    ExampleDefBuilder setLabel(String label);
}
