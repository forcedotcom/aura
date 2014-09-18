package org.auraframework.builder;

import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.DesignDef;

public interface DesignDefBuilder extends RootDefinitionBuilder<DesignDef> {
    public DesignDefBuilder addAttributeDesign(String name, AttributeDesignDef attributeDesign);
}
