package org.auraframework.impl.design;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.builder.DesignDefBuilder;
import org.auraframework.def.*;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class DesignDefImpl extends RootDefinitionImpl<DesignDef> implements DesignDef {

    protected DesignDefImpl(Builder builder) {
        super(builder);
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        throw new UnsupportedOperationException("DesignDef cannot contain RegisterEventDefs.");
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub
        
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        // TODO is this true?
        throw new UnsupportedOperationException("DocumentationDef cannot contain AttributeDefs.");
    }

    public static class Builder extends RootDefinitionImpl.Builder<DesignDef> implements DesignDefBuilder {
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
    }
}
