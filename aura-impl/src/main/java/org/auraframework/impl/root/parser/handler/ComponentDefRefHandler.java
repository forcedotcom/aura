/*
 * Copyright (C) 2012 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.impl.root.parser.handler;

import java.util.*;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.*;
import org.auraframework.def.ComponentDefRef.Load;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Handles all references to other components. Note that while the reference to the other component is created here,
 * it is not validated until the {@link ComponentDefRefImpl#validateReferences()} method is called by loading registry.
 */
public class ComponentDefRefHandler<P extends RootDefinition> extends ParentedTagHandler<ComponentDefRef, P> {

    private List<ComponentDefRef> body;
    protected ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();

    public ComponentDefRefHandler(){
        super();
    }

    public ComponentDefRefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setDescriptor(DefDescriptorImpl.getInstance(getTagName(), ComponentDef.class));
        builder.setLocation(getLocation());
        body = new ArrayList<ComponentDefRef>();
    }

    /**
     * this one is only used by {@link HTMLComponentDefRefHandler}, which passes in the descriptor, the one above can't
     * use it cause of java stupidness
     */
    protected ComponentDefRefHandler(RootTagHandler<P> parentHandler, DefDescriptor<ComponentDef> descriptor, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setDescriptor(descriptor);
        builder.setLocation(getLocation());
        body = new ArrayList<ComponentDefRef>();
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        for(Map.Entry<DefDescriptor<AttributeDef>, AttributeDefRef> entry : getAttributes().entrySet()){
            builder.setAttribute(entry.getKey(), entry.getValue());
        }
    }

    @SuppressWarnings("rawtypes")
    @Override
    protected void readSystemAttributes() throws QuickFixException {
        super.readSystemAttributes();
        builder.setLocalId(getSystemAttributeValue("id"));
        String load = getSystemAttributeValue("load");
        if(load != null){
            Load loadVal = null;
            try{
                loadVal = Load.valueOf(load.toUpperCase());
            }catch(IllegalArgumentException e){
                throw new AuraRuntimeException(String.format("Invalid value '%s' specified for 'aura:load' attribute", load), getLocation());
            }
            builder.setLoad(loadVal);
            if(loadVal == Load.LAZY || loadVal == Load.EXCLUSIVE){
                ((BaseComponentDefHandler)getParentHandler()).setRender("client");
            }
        }
    }

    protected Map<DefDescriptor<AttributeDef>, AttributeDefRef> getAttributes() throws QuickFixException {
        //TODOJT: add varargs "validAttributeNames" to this and validate that any attributes we find are in that list.
        //TODOJT: possibly those arguments are like *Param objects with built-in value validation?
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new LinkedHashMap<DefDescriptor<AttributeDef>, AttributeDefRef>();

        for (int i = 0; i < xmlReader.getAttributeCount(); i++) {
            String attName = xmlReader.getAttributeLocalName(i);
            if(!"aura".equalsIgnoreCase(xmlReader.getAttributePrefix(i))){
                DefDescriptor<AttributeDef> att = DefDescriptorImpl.getInstance(attName, AttributeDef.class);

                String attValue = xmlReader.getAttributeValue(i);
                if (attributes.containsKey(att)) {
                    error("Duplicate values for attribute %s on tag %s", att, getTagName());
                }
                TextTokenizer tt = TextTokenizer.tokenize(attValue, getLocation());
                Object value = tt.asValue(getParentHandler());

                AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
                atBuilder.setDescriptor(att);
                atBuilder.setLocation(getLocation());
                atBuilder.setValue(value);
                attributes.put(att, atBuilder.build());
            }
        }

        return attributes;
    }

    @Override
    protected ComponentDefRef createDefinition() {
        if (!body.isEmpty()) {
            setBody(body);
        }

        // hacky. if there is an interface, grab that descriptor too
        DefDescriptor<InterfaceDef> id = DefDescriptorImpl.getInstance(builder.getDescriptor().getQualifiedName(), InterfaceDef.class);
        if (id.exists()) {
            builder.setIntfDescriptor(id);
        }

        return builder.build();
    }

    protected void setBody(List<ComponentDefRef> body){
        builder.setAttribute(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, body);
    }

    /**
     * Expects either Set tags or ComponentDefRefs
     */
    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {

        String tag = getTagName();
        if (AttributeDefRefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDefRefImpl attributeDefRef = new AttributeDefRefHandler<P>(getParentHandler(), xmlReader, source).getElement();
            builder.setAttribute(attributeDefRef.getDescriptor(), attributeDefRef);
        }else{
            body.add(getDefRefHandler(getParentHandler()).getElement());
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        body.addAll(tokenizeChildText());
    }

    @Override
    public String getHandledTag() {
        return "Component Reference";
    }

    @Override
    protected boolean handlesTag(String tag) {
        // FIXMEDLP - this handler handles many tags, but should blacklist the ones we know it doesn't handle. #W-690036
        return true;
    }

    @Override
    public void writeElement(ComponentDefRef def, Appendable out) {
        // TODO Auto-generated method stub

    }
}
