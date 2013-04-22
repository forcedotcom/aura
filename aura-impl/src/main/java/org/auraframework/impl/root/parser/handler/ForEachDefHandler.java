/*
 * Copyright (C) 2013 salesforce.com, inc.
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

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ComponentDefRef.Load;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ForEachDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.impl.root.component.ForEachDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

public class ForEachDefHandler<P extends RootDefinition> extends ParentedTagHandler<ForEachDef, P> implements
        ExpressionContainerHandler {

    public static final String TAG = "aura:foreach";

    private static final String ATTRIBUTE_REVERSE = "reverse";
    private static final String ATTRIBUTE_VAR = "var";
    private static final String ATTRIBUTE_ITEMS = "items";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_REVERSE, ATTRIBUTE_VAR,
            ATTRIBUTE_ITEMS);

    private final ForEachDefImpl.Builder builder = new ForEachDefImpl.Builder();

    private final List<ComponentDefRef> children = new ArrayList<ComponentDefRef>();

    public ForEachDefHandler() {
        super();
    }

    protected ForEachDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected ForEachDef createDefinition() {

        ComponentDefImpl.Builder componentBuilder = new ComponentDefImpl.Builder();
        builder.setLocation(getLocation());

        BaseComponentDefHandler<?> parentHandler = (BaseComponentDefHandler<?>) getParentHandler();
        SubDefDescriptor<ComponentDef, ? extends BaseComponentDef> subDefDescriptor = parentHandler
                .createSubComponentDefDescriptor(TAG);
        componentBuilder.setDescriptor(subDefDescriptor);

        DefDescriptor<AttributeDef> varAttributeDescriptor = DefDescriptorImpl.getInstance(builder.getVar(),
                AttributeDef.class);
        DefDescriptor<TypeDef> varTypeDescriptor = DefDescriptorImpl.getInstance("String", TypeDef.class); // FIXME
        AttributeDef varAttributeDef = new AttributeDefImpl(varAttributeDescriptor, componentBuilder.getDescriptor(),
                varTypeDescriptor, null, true, AttributeDef.SerializeToType.BOTH, getLocation());
        componentBuilder.addAttributeDef(varAttributeDef.getDescriptor(), varAttributeDef);

        if (!children.isEmpty()) {
            componentBuilder.facets = Lists.newArrayList();
            AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
            atBuilder.setDescriptor(DefDescriptorImpl.getInstance(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME,
                    AttributeDef.class));
            atBuilder.setLocation(startLocation);
            atBuilder.setValue(children);
            componentBuilder.facets.add(atBuilder.build());
        }

        componentBuilder.setLocation(startLocation);
        componentBuilder.extendsDescriptor = ComponentDefImpl.PROTOTYPE_COMPONENT;
        ComponentDef body = componentBuilder.build();
        builder.setBody(body);
        builder.setDescriptor(body.getDescriptor());
        builder.setOwnHash(source.getHash());

        parentHandler.addSubDef(subDefDescriptor, body);

        builder.clearAttributes();

        return builder.build();
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {

        children.add(getDefRefHandler(getParentHandler()).getElement());
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        Expression e = AuraImpl.getExpressionAdapter().buildExpression(
                TextTokenizer.unwrap(getAttributeValue(ATTRIBUTE_ITEMS)), getLocation());
        if (!(e instanceof PropertyReference)) {
            error("value of items attribute must be property reference");
        }
        builder.setItems((PropertyReference) e);
        builder.setVar(getAttributeValue(ATTRIBUTE_VAR));
        builder.setReverse(Boolean.valueOf(getAttributeValue(ATTRIBUTE_REVERSE)));
    }

    @Override
    protected void readSystemAttributes() throws QuickFixException {
        super.readSystemAttributes();
        builder.setLocalId(getSystemAttributeValue("id"));
        String load = getSystemAttributeValue("load");
        if (load != null) {
            builder.setLoad(Load.valueOf(load.toUpperCase()));
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            children.addAll(TextTokenizer.tokenize(text, getLocation()).asComponentDefRefs(this));
        }
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        // TODO Auto-generated method stub

    }

    @Override
    public void writeElement(ForEachDef def, Appendable out) {
        // TODO Auto-generated method stub

    }

}
