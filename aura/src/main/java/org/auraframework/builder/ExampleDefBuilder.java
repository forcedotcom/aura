package org.auraframework.builder;

import org.auraframework.def.ExampleDef;

public interface ExampleDefBuilder extends DefBuilder<ExampleDef, ExampleDef> {
    ExampleDefBuilder setName(String name);
    ExampleDefBuilder setRef(String qualifiedName);
}
