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
Function.RegisterNamespace("Test.Mocks");
/*
 * Canned Dom Mocks
 */
Test.Mocks.Dom = new function() {
    this.GetDocument=function(){
        return Mocks.GetMock(Object.Global(), "document", Stubs.Dom.GetDocument());
    };
    this.GetWindow=function(){
        var window=Stubs.Dom.GetWindow();
        return Mocks.GetMocks(Object.Global(), {
            "document": window.document,
            "window": window,
            "XMLHttpRequest": window.XMLHttpRequest
        });
    };
    this.GetXhr=function(){
        return Mocks.GetMock(Object.Global(), "XMLHttpRequest", Stubs.Dom.GetXhr());
    };
};