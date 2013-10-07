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

import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.component.BaseComponentDefImpl.Builder;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Source;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 */
public abstract class BaseComponentDefHandler<T extends BaseComponentDef>
        extends RootTagHandler<T> {

    private static final String ATTRIBUTE_RENDER = "render";
    private static final String ATTRIBUTE_TEMPLATE = "template";
    private static final String ATTRIBUTE_PROVIDER = "provider";
    private static final String ATTRIBUTE_EXTENSIBLE = "extensible";
    private static final String ATTRIBUTE_ABSTRACT = "abstract";
    private static final String ATTRIBUTE_ISTEMPLATE = "isTemplate";
    private static final String ATTRIBUTE_IMPLEMENTS = "implements";
    private static final String ATTRIBUTE_EXTENDS = "extends";
    private static final String ATTRIBUTE_STYLE = "style";
    private static final String ATTRIBUTE_HELPER = "helper";
    private static final String ATTRIBUTE_RENDERER = "renderer";
    private static final String ATTRIBUTE_MODEL = "model";
    private static final String ATTRIBUTE_CONTROLLER = "controller";
    private static final String ATTRIBUTE_WHITESPACE = "whitespace";

    protected final static Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .add(ATTRIBUTE_RENDER, ATTRIBUTE_TEMPLATE, ATTRIBUTE_PROVIDER,
                    ATTRIBUTE_EXTENSIBLE, ATTRIBUTE_ABSTRACT,
                    ATTRIBUTE_ISTEMPLATE, ATTRIBUTE_IMPLEMENTS,
                    ATTRIBUTE_EXTENDS, ATTRIBUTE_STYLE, ATTRIBUTE_HELPER,
                    ATTRIBUTE_RENDERER, ATTRIBUTE_MODEL, ATTRIBUTE_CONTROLLER,
                    ATTRIBUTE_WHITESPACE)
            .addAll(RootTagHandler.ALLOWED_ATTRIBUTES).build();

    private int innerCount = 0;
    private final List<ComponentDefRef> body = Lists.newArrayList();
    protected Builder<T> builder;

    public BaseComponentDefHandler() {
        super();
    }

    public BaseComponentDefHandler(DefDescriptor<T> componentDefDescriptor, Source<?> source, XMLStreamReader xmlReader) {
        super(componentDefDescriptor, source, xmlReader);
        builder = createBuilder();
        builder.setLocation(getLocation());
        builder.setDescriptor(componentDefDescriptor);
        if (source != null) {
            builder.setOwnHash(source.getHash());
        }
        builder.events = Maps.newHashMap();
        builder.interfaces = Sets.newLinkedHashSet();
        builder.eventHandlers = Lists.newArrayList();
        builder.controllerDescriptors = Lists.newArrayList();
        builder.facets = Lists.newArrayList();
        builder.expressionRefs = Sets.newHashSet();
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (AttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDefImpl attributeDef = new AttributeDefHandler<T>(this,
                    xmlReader, source).getElement();
            DefDescriptor<AttributeDef> attributeDesc = attributeDef
                    .getDescriptor();
            if (builder.getAttributeDefs().containsKey(attributeDesc)) {
                error("Duplicate definitions for attribute %s on tag %s",
                        attributeDesc.getName(), tag);
            }
            builder.getAttributeDefs().put(attributeDef.getDescriptor(),
                    attributeDef);
        } else if (RegisterEventHandler.TAG.equalsIgnoreCase(tag)) {
            RegisterEventDefImpl regDef = new RegisterEventHandler(xmlReader,
                    source).getElement();
            if (builder.events.containsKey(regDef.getAttributeName())) {
                error("Multiple events registered with name %s on tag %s",
                        regDef.getAttributeName(), tag);
            }
            builder.events.put(regDef.getAttributeName(), regDef);
        } else if (EventHandlerDefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.eventHandlers.add(new EventHandlerDefHandler(this,
                    xmlReader, source).getElement());
        } else if (AttributeDefRefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.facets.add(new AttributeDefRefHandler<T>(this, xmlReader,
                    source).getElement());
        } else if (DependencyDefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.addDependency(new DependencyDefHandler<T>(this, xmlReader,
                    source).getElement());
        } else {
            body.add(getDefRefHandler(this).getElement());
            // if it wasn't one of the above, it must be a defref, or an error
        }
    }

    protected abstract Builder<T> createBuilder();

    @Override
    protected RootDefinitionBuilder<T> getBuilder() {
        return builder;
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        boolean skip = getWhitespaceBehavior() == WhitespaceBehavior.OPTIMIZE ? AuraTextUtil
                .isNullEmptyOrWhitespace(text) : AuraTextUtil
                .isNullOrEmpty(text);
        if (!skip) {
            TextTokenizer tokenizer = TextTokenizer.tokenize(text,
                    getLocation(), getWhitespaceBehavior());
            body.addAll(tokenizer.asComponentDefRefs(this));
        }
    }

    /**
     * Bases the decision for allowing embedded scripts on the system attribute isTemplate
     * 
     * @return - returns true is isTemplate is true
     */
    @Override
    public boolean getAllowsScript() {
        return builder.isTemplate;
    }

    @SuppressWarnings("unchecked")
    @Override
    protected void readAttributes() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.setCurrentNamespace(builder.getDescriptor().getNamespace());
        Mode mode = context.getMode();

        super.readAttributes();
        String controllerName = getAttributeValue(ATTRIBUTE_CONTROLLER);
        DefDescriptor<ControllerDef> controllerDescriptor = null;
        if (controllerName != null) {
            controllerDescriptor = DefDescriptorImpl.getInstance(
                    controllerName, ControllerDef.class);
        } else {
            String apexControllerName = String.format("apex://%s.%sController",
                    defDescriptor.getNamespace(),
                    AuraTextUtil.initCap(defDescriptor.getName()));
            DefDescriptor<ControllerDef> apexDescriptor = DefDescriptorImpl
                    .getInstance(apexControllerName, ControllerDef.class);
            if (apexDescriptor.exists()) {
                controllerDescriptor = apexDescriptor;
            }
        }

        if (controllerDescriptor != null) {
            builder.controllerDescriptors.add(controllerDescriptor);
        }

        String modelName = getAttributeValue(ATTRIBUTE_MODEL);
        if (modelName != null) {
            builder.modelDefDescriptor = DefDescriptorImpl.getInstance(
                    modelName, ModelDef.class);
        } else {
            String jsModelName = String.format("js://%s.%s",
                    defDescriptor.getNamespace(), defDescriptor.getName());
            DefDescriptor<ModelDef> jsDescriptor = DefDescriptorImpl
                    .getInstance(jsModelName, ModelDef.class);
            if (jsDescriptor.exists()) {
                builder.modelDefDescriptor = jsDescriptor;
            } else {
                String apexModelName = String.format("apex://%s.%sModel",
                        defDescriptor.getNamespace(),
                        AuraTextUtil.initCap(defDescriptor.getName()));
                DefDescriptor<ModelDef> apexDescriptor = DefDescriptorImpl
                        .getInstance(apexModelName, ModelDef.class);
                if (apexDescriptor.exists()) {
                    builder.modelDefDescriptor = apexDescriptor;
                }
            }
        }

        // See if there is a clientController that has the same qname.
        String jsControllerName = String.format("js://%s.%s",
                defDescriptor.getNamespace(), defDescriptor.getName());
        DefDescriptor<ControllerDef> jsDescriptor = DefDescriptorImpl
                .getInstance(jsControllerName, ControllerDef.class);
        if (jsDescriptor.exists()) {
            builder.controllerDescriptors.add(jsDescriptor);
        }

        //
        // TODO: W-1501702
        // Need to handle dual renderers for aura:placeholder
        //
        String rendererName = getAttributeValue(ATTRIBUTE_RENDERER);
        if (rendererName != null) {
            List<String> rendererNames = AuraTextUtil.splitSimpleAndTrim(
                    rendererName, ",", 0);
            for (String renderer : rendererNames) {
                builder.addRenderer(renderer);
            }

        } else {
            // See if there is a clientRenderer that has the same qname.
            DefDescriptor<RendererDef> jsRendererDescriptor = DefDescriptorImpl
                    .getInstance(jsControllerName, RendererDef.class);
            if (jsRendererDescriptor.exists()) {
                builder.addRenderer(jsRendererDescriptor.getQualifiedName());
            }
        }

        String helperName = getAttributeValue(ATTRIBUTE_HELPER);
        if (helperName != null) {
            List<String> helperNames = AuraTextUtil.splitSimpleAndTrim(
                    helperName, ",", 0);
            for (String helper : helperNames) {
                builder.addHelper(helper);
            }

        } else {
            // See if there is a helper that has the same qname.
            DefDescriptor<HelperDef> jsHelperDescriptor = DefDescriptorImpl
                    .getInstance(jsControllerName, HelperDef.class);
            if (jsHelperDescriptor.exists()) {
                builder.addHelper(jsHelperDescriptor.getQualifiedName());
            }
        }

        // See if there is a style that has the same qname.
        String styleName = getAttributeValue(ATTRIBUTE_STYLE);
        if (AuraTextUtil.isNullEmptyOrWhitespace(styleName)) {
            styleName = String.format("css://%s.%s",
                    defDescriptor.getNamespace(), defDescriptor.getName());
        }
        DefDescriptor<StyleDef> cssDescriptor = DefDescriptorImpl.getInstance(
                styleName, StyleDef.class);
        if (cssDescriptor.exists()) {
            builder.styleDescriptor = cssDescriptor;
        }

        // Do not consider Javascript Test suite defs in PROD and PRODDEBUG modes.
        if (mode != Mode.PROD && mode != Mode.PRODDEBUG) {
            // See if there is a test suite that has the same qname.
            DefDescriptor<TestSuiteDef> jsTestSuiteDescriptor = DefDescriptorImpl
                    .getInstance(jsControllerName, TestSuiteDef.class);
            if (jsTestSuiteDescriptor.exists()) {
                builder.testSuiteDefDescriptor = jsTestSuiteDescriptor;
            }
        }
        String extendsName = getAttributeValue(ATTRIBUTE_EXTENDS);
        if (extendsName != null) {
            builder.extendsDescriptor = DefDescriptorImpl.getInstance(
                    extendsName, (Class<T>) defDescriptor.getDefType()
                            .getPrimaryInterface());
        }

        String implementsNames = getAttributeValue(ATTRIBUTE_IMPLEMENTS);
        if (implementsNames != null) {
            for (String implementsName : AuraTextUtil.splitSimple(",",
                    implementsNames)) {
                builder.interfaces.add(DefDescriptorImpl.getInstance(
                        implementsName.trim(), InterfaceDef.class));
            }
        }

        builder.isAbstract = getBooleanAttributeValue(ATTRIBUTE_ABSTRACT);
        // if a component is abstract, it should be extensible by default
        if (builder.isAbstract
                && getAttributeValue(ATTRIBUTE_EXTENSIBLE) == null) {
            builder.isExtensible = true;
        } else {
            builder.isExtensible = getBooleanAttributeValue(ATTRIBUTE_EXTENSIBLE);
        }

        String providerName = getAttributeValue(ATTRIBUTE_PROVIDER);

        if (providerName != null) {
            List<String> providerNames = AuraTextUtil.splitSimpleAndTrim(
                    providerName, ",", 0);
            for (String provider : providerNames) {
                builder.addProvider(provider);
            }
        } else {
            String apexProviderName = String.format("apex://%s.%sProvider",
                    defDescriptor.getNamespace(),
                    AuraTextUtil.initCap(defDescriptor.getName()));
            DefDescriptor<ProviderDef> apexDescriptor = DefDescriptorImpl
                    .getInstance(apexProviderName, ProviderDef.class);
            if (apexDescriptor.exists()) {
                builder.addProvider(apexDescriptor.getQualifiedName());
            }
        }

        String templateName = getAttributeValue(ATTRIBUTE_TEMPLATE);
        if (templateName != null) {
            builder.templateDefDescriptor = DefDescriptorImpl.getInstance(
                    templateName, ComponentDef.class);
        }

        builder.render = getAttributeValue(ATTRIBUTE_RENDER);

        String whitespaceVal = getAttributeValue(ATTRIBUTE_WHITESPACE);
        builder.whitespaceBehavior = whitespaceVal == null ? WhitespaceBehavior.OPTIMIZE
                : WhitespaceBehavior.valueOf(whitespaceVal.toUpperCase());

        builder.isTemplate = getBooleanAttributeValue(ATTRIBUTE_ISTEMPLATE);
    }

    public void setRender(String val) {
        builder.render = val;
    }

    @Override
    public void setWhitespaceBehavior(WhitespaceBehavior val) {
        builder.whitespaceBehavior = val;
    }

    @Override
    public WhitespaceBehavior getWhitespaceBehavior() {
        return builder.whitespaceBehavior;
    }

    public SubDefDescriptor<ComponentDef, T> createSubComponentDefDescriptor(
            String type) {
        return SubDefDescriptorImpl.getInstance(type + (innerCount++),
                getDefDescriptor(), ComponentDef.class);
    }

    @SuppressWarnings("unchecked")
    public void addSubDef(
            SubDefDescriptor<ComponentDef, ? extends BaseComponentDef> descriptor,
            ComponentDef inner) {
        builder.addSubDef((SubDefDescriptor<ComponentDef, T>) descriptor, inner);
    }

    @Override
    protected T createDefinition() throws QuickFixException {

        if (!body.isEmpty()) {
            AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
            atBuilder.setDescriptor(DefDescriptorImpl.getInstance(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME,
                    AttributeDef.class));
            atBuilder.setLocation(getLocation());
            atBuilder.setValue(body);
            AttributeDefRef adr = atBuilder.build();
            builder.facets.add(adr);
        }

        return builder.build();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        builder.expressionRefs.addAll(propRefs);
    }
}
