package org.auraframework.builder;

import org.auraframework.def.AttributeDesignDef;

public interface AttributeDesignDefBuilder extends DefBuilder<AttributeDesignDef, AttributeDesignDef> {
    public AttributeDesignDefBuilder setName(String name);
    public AttributeDesignDefBuilder setType(String type);
    public AttributeDesignDefBuilder setRequired(Boolean required);
    public AttributeDesignDefBuilder setReadOnly(Boolean readonly);
    public AttributeDesignDefBuilder setDependency(String dependency);
    public AttributeDesignDefBuilder setDataSource(String datasource);
    public AttributeDesignDefBuilder setMin(String min);
    public AttributeDesignDefBuilder setMax(String max);
}
