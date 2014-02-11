package org.auraframework.impl.documentation;

import java.io.IOException;

import org.auraframework.builder.DescriptionDefBuilder;
import org.auraframework.def.DescriptionDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.util.json.Json;

public class DescriptionDefImpl extends DefinitionImpl<DescriptionDef> implements DescriptionDef {

	private static final long serialVersionUID = 3677136390357266769L;

	private String body;
	private String id;
	
	protected DescriptionDefImpl(Builder builder) {
        super(builder);
        
        this.body = builder.body;
        this.id = builder.id;
    }

    public String getBody() {
		return body;
	}

	public String getId() {
		return id;
	}

	@Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub
        
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<DescriptionDef> implements DescriptionDefBuilder {
        private String body;
		private String id;

		public Builder() {
            super(DescriptionDef.class);
        }

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DescriptionDefImpl build() {
            return new DescriptionDefImpl(this);
        }
        
        public void setBody(String body) {
            this.body = body;
        }
        
        public void setId(String id) {
            this.id = id;
        }
    }
}
