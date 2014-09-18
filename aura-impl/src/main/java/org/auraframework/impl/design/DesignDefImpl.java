package org.auraframework.impl.design;

import java.io.IOException;
import java.util.*;

import org.auraframework.builder.DesignDefBuilder;
import org.auraframework.def.*;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

public class DesignDefImpl extends RootDefinitionImpl<DesignDef> implements DesignDef {

    private final LinkedHashMap<String, AttributeDesignDef> attributeDesignDefs;
    
    protected DesignDefImpl(Builder builder) {
        super(builder);
        this.attributeDesignDefs = builder.attributeDesignMap;
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        throw new UnsupportedOperationException("DesignDef cannot contain RegisterEventDefs.");
    }
    
    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        throw new UnsupportedOperationException("DocumentationDef cannot contain AttributeDefs.");
    }
    
    @Override
    public Map<String, AttributeDesignDef> getAttributeDesignDefs() {
        return attributeDesignDefs;
    }


    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return DefDescriptorImpl.compare(descriptor,  other) == 0;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        return ret;
    }
    
    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub
        
    }

    public static class Builder extends RootDefinitionImpl.Builder<DesignDef> implements DesignDefBuilder {
        private final LinkedHashMap<String, AttributeDesignDef> attributeDesignMap = new LinkedHashMap<String, AttributeDesignDef>();
        
        public Builder() {
            super(DesignDef.class);
        }

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DesignDefImpl build() {
            return new DesignDefImpl(this);
        }
        
        @Override
        public DesignDefBuilder addAttributeDesign(String name, AttributeDesignDef attributeDesign) {
            this.attributeDesignMap.put(name, attributeDesign);
            return this;
        }
    }
}
