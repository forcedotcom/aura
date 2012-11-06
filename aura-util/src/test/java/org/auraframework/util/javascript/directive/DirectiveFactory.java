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
package org.auraframework.util.javascript.directive;

import java.io.IOException;
import java.util.List;

import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;
import org.auraframework.util.javascript.directive.impl.DirectiveImpl;
/**
 * This class acts as a repository of Directives used for testing the Directive based javascript group processing.
 *
 *
 * @since 138
 */
public class DirectiveFactory {
    private static class EndDirective extends DirectiveImpl{
        public EndDirective(int offset, String line) {
            super(offset, line);
        }

        @Override
        public String generateOutput(JavascriptGeneratorMode mode) {
            return JavascriptGeneratorMode.TESTING.toString()+"\n";
        }

        @Override
        public void processDirective(DirectiveBasedJavascriptGroup parser) throws IOException {

        }

        @Override
        public List<JavascriptProcessingError> validate(JavascriptValidator validator) {
            return null;
        }
    }
    private static class EndDirectiveType implements DirectiveType<EndDirective> {

        @Override
        public EndDirective constructDirective(int offset, String line) {
            return new EndDirective(offset, line);
        }

        @Override
        public String getLabel() {
            return "end";
        }
    }
    /*A mock directive which just replaces the word "blah" with its key. The
     * (key, value) pair is provided as part of the directive configuration in the source javascript file.
     */
    private static class MockDirective extends DirectiveImpl {

        public MockDirective(int offset, String line) {
            super(offset, line);
        }

        @Override
        public String generateOutput(JavascriptGeneratorMode mode) {
            Object o = getConfig().get("blah");
            return o != null ? o.toString() : "";
        }

        @Override
        public void processDirective(DirectiveBasedJavascriptGroup parser) throws IOException {

        }

        @Override
        public List<JavascriptProcessingError> validate(JavascriptValidator validator) {
            return null;
        }

    }
    private static class MockDirectiveType implements DirectiveType<MockDirective> {

        @Override
        public MockDirective constructDirective(int offset, String line) {
            return new MockDirective(offset, line);
        }

        @Override
        public String getLabel() {
            return "mock";
        }
    }
    /*
     * A dummy directive which just generates the word "TESTINGdummy" in all modes
     */
    private static class DummyDirective extends DirectiveImpl {

        public DummyDirective(int offset, String line) {
            super(offset, line);
        }

        @Override
        public String generateOutput(JavascriptGeneratorMode mode) {
            return "\n"+JavascriptGeneratorMode.TESTING.toString()+ "dummy\n";
        }

        @Override
        public void processDirective(DirectiveBasedJavascriptGroup parser) throws IOException {

        }

        @Override
        public List<JavascriptProcessingError> validate(JavascriptValidator validator) {
            return null;
        }

    }
    private static class DummyDirectiveType implements DirectiveType<DummyDirective> {

        @Override
        public DummyDirective constructDirective(int offset, String line) {
            return new DummyDirective(offset, line);
        }

        @Override
        public String getLabel() {
            return "dummy";
        }
    }
    /*
     * A multiline mock directive.
     * In testing mode, this just generated the contents as is from the directive specified in the source js file.
     * In all other modes, it just specifies the mode it is processing the group in.
     */

    private static class MultiLineMockDirective extends DirectiveImpl {

        public MultiLineMockDirective(int offset, String line) {
            super(offset, line);
        }

        //Just throws the content as is appears in the source code
        //Just a helper
        @Override
        public String generateOutput(JavascriptGeneratorMode mode) {
            if(mode.equals(JavascriptGeneratorMode.TESTING))
                return getContent();
            else
                return "/* generating in: "+mode.name() + "*/\n";
        }

        @Override
        public void processDirective(DirectiveBasedJavascriptGroup parser) throws IOException {

        }

        @Override
        public List<JavascriptProcessingError> validate(JavascriptValidator validator) {
            return null;
        }

        @Override
        public boolean isMultiline(){
            return true;
        }
        //Helper method to test setContent
        @Override
        public String getContent(){
            return super.getContent();
        }

    }
    private static class MultiLineMockDirectiveType implements DirectiveType<MultiLineMockDirective> {

        @Override
        public MultiLineMockDirective constructDirective(int offset, String line) {
            return new MultiLineMockDirective(offset, line);
        }

        @Override
        public String getLabel() {
            return "multilinemock";
        }
    }

    public static DirectiveType<?> getEndDirective(){
        return new EndDirectiveType();
    }
    public static DirectiveType<?> getMockDirective(){
        return new MockDirectiveType();
    }
    public static DirectiveType<?> getDummyDirectiveType(){
        return new DummyDirectiveType();
    }
    public static DirectiveType<?> getMultiLineMockDirectiveType(){
        return new MultiLineMockDirectiveType();
    }
}
