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
import java.util.Map;
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
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.MethodDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.ResourceDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.RequiredVersionDefImpl;
import org.auraframework.impl.root.component.BaseComponentDefImpl.Builder;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
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
public abstract class BaseComponentDefHandler<T extends BaseComponentDef, B extends Builder<T>> extends RootTagHandler<T> {

    private static final String ATTRIBUTE_RENDER = "render";
    protected static final String ATTRIBUTE_TEMPLATE = "template";
    private static final String ATTRIBUTE_PROVIDER = "provider";
    private static final String ATTRIBUTE_EXTENSIBLE = "extensible";
    private static final String ATTRIBUTE_ABSTRACT = "abstract";
    private static final String ATTRIBUTE_IMPLEMENTS = "implements";
    private static final String ATTRIBUTE_EXTENDS = "extends";
    private static final String ATTRIBUTE_STYLE = "style";
    private static final String ATTRIBUTE_HELPER = "helper";
    private static final String ATTRIBUTE_RENDERER = "renderer";
    private static final String ATTRIBUTE_MODEL = "model";
    private static final String ATTRIBUTE_CONTROLLER = "controller";
    private static final String ATTRIBUTE_WHITESPACE = "whitespace";
    private static final String ATTRIBUTE_TOKEN_OVERRIDES = "tokens";
    private static final String ATTRIBUTE_DEFAULT_FLAVOR = "defaultFlavor";
    private static final String ATTRIBUTE_DYNAMICALLY_FLAVORABLE = "dynamicallyFlavorable";

    protected static final Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .add(ATTRIBUTE_IMPLEMENTS, ATTRIBUTE_ACCESS, ATTRIBUTE_MODEL, ATTRIBUTE_CONTROLLER, ATTRIBUTE_EXTENDS,
                    ATTRIBUTE_EXTENSIBLE, ATTRIBUTE_ABSTRACT, RootTagHandler.ATTRIBUTE_API_VERSION)
            .addAll(RootTagHandler.ALLOWED_ATTRIBUTES).build();

    protected static final Set<String> PRIVILEGED_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(
            ATTRIBUTE_RENDER, ATTRIBUTE_TEMPLATE, ATTRIBUTE_PROVIDER,
            ATTRIBUTE_STYLE, ATTRIBUTE_HELPER, ATTRIBUTE_RENDERER,
            ATTRIBUTE_WHITESPACE, ATTRIBUTE_TOKEN_OVERRIDES, ATTRIBUTE_DEFAULT_FLAVOR,
            ATTRIBUTE_DYNAMICALLY_FLAVORABLE)
            .addAll(ALLOWED_ATTRIBUTES).addAll(RootTagHandler.PRIVILEGED_ALLOWED_ATTRIBUTES)
            .build();

    private int innerCount = 0;
    private final List<ComponentDefRef> body = Lists.newArrayList();
    protected B builder;

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
        builder.imports = Lists.newArrayList();
        builder.controllerDescriptors = Lists.newArrayList();
        builder.facets = Lists.newArrayList();
        builder.expressionRefs = Sets.newHashSet();
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInPrivilegedNamespace ? PRIVILEGED_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (AttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDefHandler<T> handler = new AttributeDefHandler<>(this, xmlReader, source);
            AttributeDefImpl attributeDef = handler.getElement();
            DefDescriptor<AttributeDef> attributeDesc = attributeDef.getDescriptor();
            DefDescriptor<MethodDef> methodDef = DefDescriptorImpl.getInstance(attributeDesc.getName(), MethodDef.class);
            if (builder.getAttributeDefs().containsKey(attributeDesc)) {
                tagError(
                    "There is already an attribute named '%s' on %s '%s'.",
                    handler.getParentHandler().getDefDescriptor(),
                    attributeDesc.getName(),
                    "%s", "%s"
                );
            }

            if (builder.getMethodDefs().containsKey(methodDef)) {
                tagError("The attribute '%s' conflicts with a method of the same name on %s '%s'.",
                    handler.getParentHandler().getDefDescriptor(),
                    attributeDesc.getName(),
                    "%s","%s"
                );
            }

            builder.getAttributeDefs().put(attributeDef.getDescriptor(),attributeDef);
        } else if (isInPrivilegedNamespace && RequiredVersionDefHandler.TAG.equalsIgnoreCase(tag)) {
        	RequiredVersionDefHandler<T> handler = new RequiredVersionDefHandler<>(this,xmlReader, source);
            RequiredVersionDefImpl requiredVersionDef = handler.getElement();
        	DefDescriptor<RequiredVersionDef> requiredVersionDesc = requiredVersionDef.getDescriptor();
        	if (builder.getRequiredVersionDefs().containsKey(requiredVersionDesc)) {
        		tagError(
                        "There is already a namespace '%s' on %s '%s'.",
                        handler.getParentHandler().getDefDescriptor(),
                        requiredVersionDesc.getName(),
                        "%s", "%s"
                );
        	}
        	builder.getRequiredVersionDefs().put(requiredVersionDesc, requiredVersionDef);
        } else if (RegisterEventHandler.TAG.equalsIgnoreCase(tag)) {
            RegisterEventHandler<T> handler = new RegisterEventHandler<>(this, xmlReader, source);
            RegisterEventDefImpl regDef = handler.getElement();
            DefDescriptor<MethodDef> methodDef = DefDescriptorImpl.getInstance(regDef.getAttributeName(), MethodDef.class);
            if (builder.events.containsKey(regDef.getAttributeName())) {
                tagError("There is already an event named '%s' registered on %s '%s'.",
                        handler.getParentHandler().getDefDescriptor(),
                        regDef.getAttributeName(),
                        "%s", "%s"
                );
            }

            if (builder.getMethodDefs().containsKey(methodDef)) {
                tagError("The event '%s' conflicts with a method of the same name on %s '%s'.",
                    handler.getParentHandler().getDefDescriptor(),
                    regDef.getAttributeName(),
                    "%s","%s"
                );
            }

            builder.events.put(regDef.getAttributeName(), regDef);
        } else if (EventHandlerDefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.eventHandlers.add(new EventHandlerDefHandler(this, xmlReader, source).getElement());
        } else if (LibraryDefRefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.imports.add(new LibraryDefRefHandler(this, xmlReader, source).getElement());
        } else if (AttributeDefRefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.facets.add(new AttributeDefRefHandler<>(this, xmlReader, source).getElement());
        } else if (DependencyDefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.addDependency(new DependencyDefHandler<>(this, xmlReader, source).getElement());
        } else if (ClientLibraryDefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.addClientLibrary(new ClientLibraryDefHandler<>(this, xmlReader, source).getElement());
        } else if (MethodDefHandler.TAG.equalsIgnoreCase(tag)) {
            MethodDefHandler<T> handler=new MethodDefHandler<>(this, xmlReader, source);
            MethodDef methodDef = handler.getElement();
            DefDescriptor<MethodDef> methodDesc = methodDef.getDescriptor();
            String methodName=methodDesc.getName();
            if (builder.getAttributeDefs().containsKey(DefDescriptorImpl.getInstance(methodName, AttributeDef.class))) {
                tagError("The method '%s' conflicts with an attribute of the same name on %s '%s'.",
                    handler.getParentHandler().getDefDescriptor(),
                    methodName,
                    "%s","%s"
                );
            }
            if (builder.events.containsKey(methodName)) {
                tagError("The method '%s' conflicts with an event of the same name on %s '%s'.",
                    handler.getParentHandler().getDefDescriptor(),
                    methodName,
                    "%s", "%s"
                );
            }
            if (builder.getMethodDefs().containsKey(methodDesc)) {
                tagError("There is already a method named '%s' on %s '%s'.",
                    handler.getParentHandler().getDefDescriptor(),
                    methodName,
                    "%s","%s"
                );
            }
            builder.getMethodDefs().put(methodDef.getDescriptor(),methodDef);
        } else {
            // if it wasn't one of the above, it must be a defref, or an error
            ComponentDefRef cdr = getDefRefHandler(this).getElement();
            if (cdr.isFlavorable() || cdr.hasFlavorableChild()) {
                builder.setHasFlavorableChild(true);
            }
            body.add(cdr);
        }
    }

    protected abstract B createBuilder();

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
        MasterDefRegistry mdr = context.getDefRegistry();
        context.pushCallingDescriptor(builder.getDescriptor());
        try {
            super.readAttributes();
            String controllerName = getAttributeValue(ATTRIBUTE_CONTROLLER);
            DefDescriptor<ControllerDef> controllerDescriptor = null;
            if (controllerName != null) {
                controllerDescriptor = getDefDescriptor(controllerName, ControllerDef.class);
            } else {
                String apexControllerName = String.format("apex://%s.%sController",
                        defDescriptor.getNamespace(),
                        AuraTextUtil.initCap(defDescriptor.getName()));
                DefDescriptor<ControllerDef> apexDescriptor = DefDescriptorImpl
                        .getInstance(apexControllerName, ControllerDef.class);
                if (mdr.exists(apexDescriptor)) {
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
                if (mdr.exists(jsDescriptor)) {
                    builder.modelDefDescriptor = jsDescriptor;
                } else {
                    String apexModelName = String.format("apex://%s.%sModel",
                            defDescriptor.getNamespace(),
                            AuraTextUtil.initCap(defDescriptor.getName()));
                    DefDescriptor<ModelDef> apexDescriptor = DefDescriptorImpl
                            .getInstance(apexModelName, ModelDef.class);
                    if (mdr.exists(apexDescriptor)) {
                        builder.modelDefDescriptor = apexDescriptor;
                    }
                }
            }

            // See if there is a clientController that has the same qname.
            String jsDescriptorName = String.format("js://%s.%s",
                    defDescriptor.getNamespace(), defDescriptor.getName());
            DefDescriptor<ControllerDef> jsDescriptor = DefDescriptorImpl
                    .getInstance(jsDescriptorName, ControllerDef.class);
            if (mdr.exists(jsDescriptor)) {
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
                        .getInstance(jsDescriptorName, RendererDef.class);
                if (mdr.exists(jsRendererDescriptor)) {
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
                        .getInstance(jsDescriptorName, HelperDef.class);
                if (mdr.exists(jsHelperDescriptor)) {
                    builder.addHelper(jsHelperDescriptor.getQualifiedName());
                }
            }

            DefDescriptor<ResourceDef> jsResourceDescriptor = DefDescriptorImpl
                    .getInstance(jsDescriptorName, ResourceDef.class);
            if (mdr.exists(jsResourceDescriptor)) {
                builder.addResource(jsResourceDescriptor.getQualifiedName());
            }

            // See if there is a style that has the same qname.
            String styleName = getAttributeValue(ATTRIBUTE_STYLE);
            if (AuraTextUtil.isNullEmptyOrWhitespace(styleName)) {
                styleName = String.format("css://%s.%s",
                        defDescriptor.getNamespace(), defDescriptor.getName());
            }
            DefDescriptor<StyleDef> cssDescriptor = DefDescriptorImpl.getInstance(
                    styleName, StyleDef.class);
            if (mdr.exists(cssDescriptor)) {
                builder.styleDescriptor = cssDescriptor;
            }

            DefDescriptor<ResourceDef> cssResourceDescriptor = DefDescriptorImpl.getInstance(styleName,
                    ResourceDef.class);
            if (mdr.exists(cssResourceDescriptor)) {
                builder.addResource(cssResourceDescriptor.getQualifiedName());
            }

            // see if there is a flavored style def that has the same qname
            DefDescriptor<FlavoredStyleDef> flavorDesc = Flavors.standardFlavorDescriptor(defDescriptor);
            if (mdr.exists(flavorDesc)) {
                builder.flavoredStyleDescriptor = flavorDesc;
            }

            String extendsName = getAttributeValue(ATTRIBUTE_EXTENDS);
            if (extendsName != null) {
                builder.extendsDescriptor = getDefDescriptor(extendsName,
                        (Class<T>) defDescriptor.getDefType().getPrimaryInterface());
            }

            String implementsNames = getAttributeValue(ATTRIBUTE_IMPLEMENTS);
            if (implementsNames != null) {
                for (String implementsName : AuraTextUtil.splitSimple(",",implementsNames)) {
                    builder.interfaces.add(getDefDescriptor((implementsName.trim()), InterfaceDef.class));
                }
            }

            builder.isAbstract = getBooleanAttributeValue(ATTRIBUTE_ABSTRACT);
            // if a component is abstract, it should be extensible by default
            if (builder.isAbstract && getAttributeValue(ATTRIBUTE_EXTENSIBLE) == null) {
                // JBUCH: HALO: TODO: THEN THIS SHOULD THROW AN ERROR.
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
                if (mdr.exists(apexDescriptor)) {
                    builder.addProvider(apexDescriptor.getQualifiedName());
                }
            }

            String templateName = getAttributeValue(ATTRIBUTE_TEMPLATE);
            if (templateName != null) {
                builder.templateDefDescriptor = DefDescriptorImpl.getInstance(
                        templateName, ComponentDef.class);
            }

            DefDescriptor<DocumentationDef> documentationDescriptor = DefDescriptorImpl.getAssociateDescriptor(
                    builder.getDescriptor(), DocumentationDef.class, DefDescriptor.MARKUP_PREFIX);

            if (mdr.exists(documentationDescriptor)) {
                builder.setDocumentation(documentationDescriptor.getQualifiedName());
            }

            DefDescriptor<DesignDef> designDescriptor = DefDescriptorImpl.getAssociateDescriptor(
                    builder.getDescriptor(), DesignDef.class, DefDescriptor.MARKUP_PREFIX);

            if (mdr.exists(designDescriptor)) {
                builder.designDefDescriptor = designDescriptor;
            }

            DefDescriptor<SVGDef> svgDescriptor = DefDescriptorImpl.getAssociateDescriptor(builder.getDescriptor(),
                    SVGDef.class, DefDescriptor.MARKUP_PREFIX);

            if (mdr.exists(svgDescriptor)) {
                builder.svgDefDescriptor = svgDescriptor;
            }

            builder.render = getAttributeValue(ATTRIBUTE_RENDER);

            String whitespaceVal = getAttributeValue(ATTRIBUTE_WHITESPACE);
            builder.whitespaceBehavior = whitespaceVal == null ? WhitespaceBehavior.OPTIMIZE
                    : WhitespaceBehavior.valueOf(whitespaceVal.toUpperCase());

            builder.setAccess(readAccessAttribute());

            String tokenOverrides = getAttributeValue(ATTRIBUTE_TOKEN_OVERRIDES);
            if (!AuraTextUtil.isNullEmptyOrWhitespace(tokenOverrides)) {
                builder.setTokenOverrides(tokenOverrides);
            }

            // flavor overrides can only be parsed in the app handler for now--
            // need to figure out a solution to bring it here (see notes there)

            String defaultFlavor = getAttributeValue(ATTRIBUTE_DEFAULT_FLAVOR);
            if (!AuraTextUtil.isNullEmptyOrWhitespace(defaultFlavor)) {
                builder.setDefaultFlavor(defaultFlavor);
            }

            if (getBooleanAttributeValue(ATTRIBUTE_DYNAMICALLY_FLAVORABLE)) {
                builder.setDynamicallyFlavorable(true);
            }
        } finally {
            context.popCallingDescriptor();
        }
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
        Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> requiredVersionDefs = readRequiredVersionDefs(defDescriptor);
        if(requiredVersionDefs != null) {
        	builder.setRequiredVersionDefs(requiredVersionDefs);
        }

        return builder.build();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        builder.expressionRefs.addAll(propRefs);
    }
}
