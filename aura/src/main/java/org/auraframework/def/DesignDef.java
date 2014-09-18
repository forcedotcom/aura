package org.auraframework.def;

import java.util.Map;

/**
 * 
 * DesignDef handles .design files within the component bundle
 *
 */
public interface DesignDef extends RootDefinition {
    public Map<String, AttributeDesignDef> getAttributeDesignDefs();
}
