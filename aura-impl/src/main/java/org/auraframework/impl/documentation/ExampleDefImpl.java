package org.auraframework.impl.documentation;

import java.io.IOException;

import org.auraframework.def.ExampleDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.util.json.Json;

public class ExampleDefImpl extends DefinitionImpl<ExampleDef> implements ExampleDef {

	private static final long serialVersionUID = -4467201134487458023L;

	protected ExampleDefImpl(org.auraframework.impl.system.DefinitionImpl.RefBuilderImpl<ExampleDef, ?> builder) {
        super(builder);
        // TODO Auto-generated constructor stub
    }

    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub
        
    }    

    public static class Builder extends DefinitionImpl.BuilderImpl<ExampleDef> {

        public Builder() {
            super(ExampleDef.class);
        }

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public ExampleDefImpl build() {
            return new ExampleDefImpl(this);
        }
    }

	@Override
	public String getLabel() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getMarkup() {
		// TODO Auto-generated method stub
		return null;
	}
}
