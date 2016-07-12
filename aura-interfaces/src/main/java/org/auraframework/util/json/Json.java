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
package org.auraframework.util.json;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Collection;
import java.util.Date;
import java.util.Map;

import org.auraframework.util.json.Serialization.ReferenceScope;

/**
 * Json interface
 */
public interface Json {

    enum IndentType {
        BRACE(true, "  "), SQUARE(true, "  "), PARAM(true, ""), COMMENT(false, " * ");

        private boolean separated;
        private String indent;

        IndentType(boolean separated, String indent) {
            this.separated = separated;
            this.indent = indent;
        }

        /**
         * Determines if this instance is separated.
         *
         * @return The separated.
         */
        public boolean isSeparated() {
            return this.separated;
        }

        /**
         * Gets the indent for this instance.
         *
         * @return The indent.
         */
        public String getIndent() {
            return this.indent;
        }
    }

    /*
    * JBUCH: HALO: TODO:
    *
    * ApplicationKey Enum to provide key based minification while serializing json
    * Ideally, we will replace all uses of pure strings on the Server and Client; and be able to use
    * the shortName in non-dev scenarios (resulting in 10-40% app.js size reduction).
    *
    * *sigh* I had it mostly working, but had to abandon branch due to large code change conflicts
    * with other team members. Because of that, I can only afford to change these four right now,
    * since they are used directly in this file for the structure of the frame, or net new:
    * ACCESS (access), SERIAL_ID (serId), SERIAL_REFID (serRefId), VALUE (value)
    *
    * While these three don't buy us much, my current hope is only to offset the additional cost
    * of access="G|P" values in the definitions.
    *
    * */
    enum ApplicationKey {
        ABSTRACT("isAbstract","ab"),
        ACCESS("xs" /*"access"*/,"xs"),
        ACTION("action","x"),
        ACTIONS("action","xx"),
        ACTIONDEFS("actionDefs","ac"),
        ACTIONTYPE("actionType","at"),
        ATTRIBUTES("attributes","a"),
        ATTRIBUTEDEFS("attributeDefs","ad"),
        COMPONENTDEF("componentDef","c"),
        CONTROLLERDEF("controllerDef","cd"),
        CREATIONPATH("creationPath","cp"),
        CSSPRELOADED("isCSSPreloaded","css"),
        DEFAULT("default","d"),
        DEFTYPE("defType","dt"),
        DESCRIPTOR("descriptor","de"),
        EVENTDEF("eventDef","ed"),
        EVENTS("events","e"),
        FACETS("facets","fa"),
        FUNCTIONS("functions","f"),
        HANDLERS("handlers","eh"),
        HASSERVERDEPENDENCIES("hasServerDeps","hs"),
        HELPERDEF("helperDef","h"),
        INCLUDES("includes","ic"),
        INTERFACES("interfaces","i"),
        LOCALID("localId","lid"),
        MEMBERS("members","mm"),
        MODEL("model","m"),
        MODELDEF("modelDef","md"),
        METHODS("methods","me"),
        NAME("name","n"),
        ORIGINAL("original","o"),
        PARAMS("params","pa"),
        PROVIDE("provide","p"),
        PROVIDERDEF("providerDef","pd"),
        REGISTEREVENTDEFS("registerEventDefs","re"),
        RENDERERDEF("rendererDef","rd"),
        REQUIRED("required","rq"),
        REQUIREDVERSIONDEFS("requiredVersionDefs","rv"),
        RETURNTYPE("returnType","rt"),
        SERIAL_ID("s"/*"serId"*/,"sid"),
        SERIAL_REFID("r"/*"serRefId"*/,"rid"),
        STYLEDEF("styleDef","st"),
        SUBDEFS("subDefs","sb"),
        SUPERDEF("superDef","su"),
        TYPE("type","t"),
        VALUE("v"/*"value"*/,"v"),
        VALUES("values","vv"),
        VALUEPROVIDER("valueProvider","vp");

        private String name;
        private String shortName;

        ApplicationKey(String name, String shortName){
            this.name=name;
            this.shortName=shortName;
        }

        @Override
        public String toString(){
            return useShortName?this.shortName:this.name;
        }

        private static Boolean useShortName=false;
        public static void useShortKey(Boolean useShortKey){
            useShortName=useShortKey;
        }
    }

    void checkIndent(IndentType type, String message);
    void clearReferences();
    void close() throws IOException;

    Appendable getAppendable();
    String getIndent();
    Integer getRefId(ReferenceScope rs, Object value);
    JsonSerializationContext getSerializationContext();
    void pushIndent(IndentType type);
    void popIndent(IndentType type, String message);
    void writeArray(Collection<?> array) throws IOException;
    void writeArray(Object[] array) throws IOException;
    void writeArrayBegin() throws IOException;
    void writeArrayEnd() throws IOException;
    void writeArrayEntry(Object value) throws IOException;
    OutputStream writeBinaryStreamBegin(long streamLength) throws IOException;
    void writeBinaryStreamEnd() throws IOException;
    void writeBreak() throws IOException;
    void writeComma() throws IOException;
    void writeComment(String body) throws IOException;
    void writeCommentBegin() throws IOException;
    void writeCommentBody(String body) throws IOException;
    void writeCommentEnd() throws IOException;
    void writeDate(Date value) throws IOException;
    void writeIndent() throws IOException;
    void writeLiteral(Object value) throws IOException;
    void writeMap(Map<?, ?> map) throws IOException;
    void writeMapBegin() throws IOException;
    void writeMapEnd() throws IOException;
    void writeMapEntry(Object key, Object value) throws IOException;
    void writeMapEntry(Object key, Object value, String type) throws IOException;
    void writeMapKey(Object key) throws IOException;
    void writeMapSeparator() throws IOException;
    void writeString(Object value) throws IOException;
    void writeValue(Object value) throws IOException;
}
