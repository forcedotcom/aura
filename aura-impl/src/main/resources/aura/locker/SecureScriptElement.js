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

function SecureScriptElement(){}

SecureScriptElement.setOverrides = function(elementOverrides, prototype){
    function getAttributeName(name) {
        return name.toLowerCase() === "src" ? "data-locker-src" : name;
    }

    elementOverrides["src"] = {
            enumerable: true,
            get: function () {
                return this.getAttribute.apply(this, ["src"]);
            },
            set: function (value) {
                this.setAttribute.apply(this, ["src", value]);
            }
    };

    var orignalGetAttribute = prototype.getAttribute;
    elementOverrides["getAttribute"]= {
            value: function (name) { 
                return orignalGetAttribute.apply(this, [getAttributeName(name)]);
            }
    };

    var orignalSetAttribute = prototype.setAttribute;
    elementOverrides["setAttribute"]= { 
            value: function (name, value) {
                orignalSetAttribute.apply(this, [getAttributeName(name), value]);
            }
    };

    var orignalGetAttributeNS = prototype.getAttributeNS;
    elementOverrides["getAttributeNS"]= {
            value: function (ns, name) { 
                return orignalGetAttributeNS.apply(this, [ns, getAttributeName(name)]);
            }
    };

    var orignalSetAttributeNS = prototype.setAttributeNS;
    elementOverrides["setAttributeNS"]= { 
            value: function (ns, name, value) {
                orignalSetAttributeNS.apply(this, [ns, getAttributeName(name), value]);
            }
    };

    var orignalGetAttributeNode = prototype.getAttributeNode;
    elementOverrides["getAttributeNode"]= {
            value: function (name) { 
                return orignalGetAttributeNode.apply(this, [getAttributeName(name)]);
            }
    };

    var orignalGetAttributeNodeNS = prototype.getAttributeNodeNS;
    elementOverrides["getAttributeNodeNS"]= {
            value: function (ns, name) { 
                return orignalGetAttributeNodeNS.apply(this, [ns, getAttributeName(name)]);
            }
    };

    elementOverrides["attributes"] = SecureObject.createFilteredPropertyStateless("attributes", prototype, {
        writable : false,
        afterGetCallback : function(attributes) {
            if (!attributes) {
                return attribute;
            }
            // Secure attributes
            var secureAttributes = [];
            var raw = SecureObject.getRaw(this);
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];

                // Only add supported attributes
                if (SecureElement.isValidAttributeName(raw, attribute.name, prototype)) {
                    var attributeName = attribute.name;
                    if(attribute.name === "src"){
                        continue;
                    }
                    if(attribute.name === "data-locker-src"){
                        attributeName = "src";
                    }                   
                    secureAttributes.push({
                        name : attributeName,
                        value : SecureObject.filterEverything(this, attribute.value)
                    });
                }
            }
            return secureAttributes;
        }
    });
};

SecureScriptElement.run = function(st) {

    var src = st.getAttribute("src");
    if (!src) {
        return;
    }

    var el = SecureObject.getRaw(st);
    document.head.appendChild(el);

    // XHR in source and secure it using $A.lockerService.create()
    var xhr = $A.services.client.createXHR();

    xhr.onreadystatechange = function() {
        var key = ls_getKey(st);
        if (xhr.readyState === 4 && xhr.status === 200) {
            $A.lockerService.create(xhr.responseText, key, src, true);

            el.dispatchEvent(new Event("load"));
        }

        // DCHASMAN TODO W-2837800 Add in error handling for 404's etc
    };

    xhr.open("GET", src, true);

    //for relative urls enable sending credentials
    if(src.indexOf("/") === 0){
        xhr.withCredentials = true;
    }
    xhr.send();
};