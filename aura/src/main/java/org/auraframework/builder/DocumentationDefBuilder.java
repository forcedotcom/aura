package org.auraframework.builder;

import org.auraframework.def.DescriptionDef;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.ExampleDef;

public interface DocumentationDefBuilder extends RootDefinitionBuilder<DocumentationDef> {
	
    public void addDescription(DescriptionDef description);
    public void addExample(ExampleDef example);
}
