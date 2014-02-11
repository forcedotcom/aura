package org.auraframework.builder;

import org.auraframework.def.DescriptionDef;

public interface DescriptionDefBuilder extends DefBuilder<DescriptionDef, DescriptionDef> {
    public void setBody(String body);    
    public void setId(String id);
}
