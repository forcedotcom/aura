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

import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.HtmlTag;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.component.HTMLDefRef;
import org.auraframework.system.Source;

import com.google.common.collect.ImmutableSet;

/**
 * Handles free HTML in component markup.
 *
 *
 *
 */
public class HTMLComponentDefRefHandler<P extends RootDefinition> extends ComponentDefRefHandler<P> {

    protected HTMLDefRef.Builder htmlBuilder = new HTMLDefRef.Builder();

    protected HTMLComponentDefRefHandler(RootTagHandler<P> parentHandler, String tag, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder = htmlBuilder;
        builder.setLocation(getLocation());
        htmlBuilder.setTag(tag.trim());
    }

    @Override
    public String getHandledTag() {
        return "HTML Component Reference";
    }

    @Override
    protected boolean handlesTag(String tag) {
        return HtmlTag.allowed(tag);
    }

    @Override
    protected void setBody(List<ComponentDefRef> body){
        htmlBuilder.setComponentAttribute(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, body);
    }


    public static final Set<String> SPECIAL_BOOLEANS = ImmutableSet.of(
        "checked",
        "selected",
        "disabled",
        "readonly",
        "multiple",
        "ismap",
        "defer",
        "declare",
        "noresize",
        "nowrap",
        "noshade",
        "compact",
        "autocomplete",
        "required"
    );
}
