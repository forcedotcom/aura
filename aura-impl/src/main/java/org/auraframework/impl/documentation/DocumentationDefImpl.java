package org.auraframework.impl.documentation;

import java.io.IOException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.builder.DocumentationDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptionDef;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.ExampleDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

public class DocumentationDefImpl extends RootDefinitionImpl<DocumentationDef> implements DocumentationDef {

	private static final long serialVersionUID = 7808842576422413967L;

	private final List<DefDescriptor<DescriptionDef>> descriptionDescriptors;
    private final List<DefDescriptor<ExampleDef>> exampleDescriptors;
	
	protected DocumentationDefImpl(Builder builder) {
        super(builder);
        
        this.descriptionDescriptors = builder.descriptionDescriptors;
        this.exampleDescriptors = builder.exampleDescriptors;
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
    	throw new UnsupportedOperationException("DocumentationDef cannot contain RegisterEventDefs.");
    }
    
    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
    	throw new UnsupportedOperationException("DocumentationDef cannot contain AttributeDefs.");
    }
    
	@Override
	public Map<String, ? extends DescriptionDef> getDescriptionDefs() throws QuickFixException {
		Map<String, DescriptionDef> map = new LinkedHashMap<String, DescriptionDef>();
		
		DescriptionDef def = null;
		String id = null;
		
		for (DefDescriptor<DescriptionDef> defDesc : this.descriptionDescriptors) {
			def = defDesc.getDef();
			id = def.getId();
			
			map.put(id, def);
		}
		
		return Collections.unmodifiableMap(map);
	}

	@Override
	public Map<String, ? extends ExampleDef> getExampleDefs() {
		// TODO Auto-generated method stub
		return null;
	}

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return null;
    }
    
    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub

    }

    public static class Builder extends RootDefinitionImpl.Builder<DocumentationDef> implements DocumentationDefBuilder {
        public Builder() {
            super(DocumentationDef.class);
        }
        
        private List<DefDescriptor<DescriptionDef>> descriptionDescriptors;
        private List<DefDescriptor<ExampleDef>> exampleDescriptors;

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DocumentationDefImpl build() {
            return new DocumentationDefImpl(this);
        }
        
        public void addDescription(DescriptionDef description) {
            if (this.descriptionDescriptors == null) {
                this.descriptionDescriptors = Lists.newArrayList();
            }
            this.descriptionDescriptors.add(description.getDescriptor());
        }
        
        public void addExample(ExampleDef example) {
            if (this.exampleDescriptors == null) {
                this.exampleDescriptors = Lists.newArrayList();
            }
            this.exampleDescriptors.add(example.getDescriptor());
        }
    }
}
