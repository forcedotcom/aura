package org.auraframework.impl.root.parser.handler;

import java.io.IOException;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.DesignDef;
import org.auraframework.impl.design.AttributeDesignDefImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class AttributeDesignDefHandler extends ParentedTagHandler<AttributeDesignDef, DesignDef> {
    public static final String TAG = "aura:designattribute";
    
    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_REQUIRED = "required";
    private static final String ATTRIBUTE_READONLY = "readonly";
    private static final String ATTRIBUTE_DEPENDENCY = "dependsOn";
    private static final String ATTRIBUTE_DATASOURCE = "dataSource";
    private static final String ATTRIBUTE_MIN = "min";
    private static final String ATTRIBUTE_MAX = "max";
    
    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_TYPE, ATTRIBUTE_REQUIRED, 
            ATTRIBUTE_READONLY, ATTRIBUTE_DEPENDENCY, ATTRIBUTE_DATASOURCE, ATTRIBUTE_MIN, ATTRIBUTE_MAX);
    
    private final AttributeDesignDefImpl.Builder builder = new AttributeDesignDefImpl.Builder();
    
    //TODO implement tool specific properties
    
    public AttributeDesignDefHandler(RootTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
    }
    
    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();
        
        String name = getAttributeValue(ATTRIBUTE_NAME);
        String type = getAttributeValue(ATTRIBUTE_TYPE);
        String required = getAttributeValue(ATTRIBUTE_REQUIRED);
        String readonly = getAttributeValue(ATTRIBUTE_READONLY);
        String dependency = getAttributeValue(ATTRIBUTE_DEPENDENCY);
        String datasource = getAttributeValue(ATTRIBUTE_DATASOURCE);
        String min = getAttributeValue(ATTRIBUTE_MIN);
        String max = getAttributeValue(ATTRIBUTE_MAX);
        
        if (!AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            
        }
        
        if (!AuraTextUtil.isNullEmptyOrWhitespace(type)) {
            
        }
        
        if (!AuraTextUtil.isNullEmptyOrWhitespace(required)) {
            
        }
        
        if (!AuraTextUtil.isNullEmptyOrWhitespace(readonly)) {
            
        }
        
        if (!AuraTextUtil.isNullEmptyOrWhitespace(dependency)) {
            
        }
        
        if (!AuraTextUtil.isNullEmptyOrWhitespace(datasource)) {
            
        }
        
        if (!AuraTextUtil.isNullEmptyOrWhitespace(min)) {
            
        }
        
        if (!AuraTextUtil.isNullEmptyOrWhitespace(max)) {
            
        }
    }
    
    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        error("Found unexpected tag %s", getTagName());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        error("No literal text allowed in attribute design definition");
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }
    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected AttributeDesignDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(AttributeDesignDef def, Appendable out) throws IOException {
        // TODO Auto-generated method stub
        
    }

}
