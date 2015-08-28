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
({
    updateValue: function (cmp) {
        var bodyElement = cmp.find("body").getElement();

        $A.util.clearNode(bodyElement);

        var value = cmp.get("v.value") || "";

        var isCallable = $A.get("$Browser.formFactor") == 'PHONE' &&
            !$A.util.isEmpty(value) && !value.match(/[a-zA-Z]/g) && value.indexOf("*") == -1 && value.indexOf("#") == -1;

        var phoneNumberNode = bodyElement;

        if (isCallable) {
            phoneNumberNode = $A.util.createHtmlElement("a", {
                "class": cmp.get("v.class"),
                "href": "tel:" + this.removeSpaces(value)
            });
            bodyElement.appendChild(phoneNumberNode);
        }
        if (!$A.util.isEmpty(value)) {
            phoneNumberNode.appendChild(document.createTextNode(this.formatPhoneNumber(value)));
        }
    },

    /*
     ** Remove spaces (if there is any) in value and return the no-space result.
     */
    removeSpaces: function (value) {
        return (value || "").replace(/\s/g, "");
    },

    formatPhoneNumber: function (rawPhoneNumber) {
        if (!rawPhoneNumber) {
            return null;
        }
        var userLocale = $A.get("$Locale.userLocaleCountry");
        if (userLocale !== "US" && userLocale !== "CA") {
            return rawPhoneNumber;
        }

        if (rawPhoneNumber.length == 0 || rawPhoneNumber[0] == '+') {
            // don't format it
            return rawPhoneNumber;
        }

        var formattedPhoneNumber = "";
        var count = 0;
        var extensionStart = -1;

        var startIndex = 0;
        // skip leading 1
        if (rawPhoneNumber[0] === '1') {
            startIndex = 1;
        }
        for (var i = startIndex; i < rawPhoneNumber.length; i++) {
            var character = rawPhoneNumber[i];

            // build up formatted number
            if (character >= '0' && character <= '9') {
                switch (count) {
                    case 0:
                        formattedPhoneNumber += "(";
                        break;
                    case 3:
                        formattedPhoneNumber += ") ";
                        break;
                    case 6:
                        formattedPhoneNumber += "-";
                        break;
                }
                formattedPhoneNumber += character;
                count++;
                if (count > 10) {
                    break;
                }
            }

            // check for extension type section
            if (isNaN(character)) {
                extensionStart = i;
                break;
            }
        }

        // add the extension
        if (extensionStart >= 0) {
            formattedPhoneNumber += " " + rawPhoneNumber.substring(extensionStart);
        }

        // Assumes that a US/Canada phone number has exactly 10 digits without the +1 international prefix,
        // If the size does not match, no formatting is done on the string
        if (count != 10 || formattedPhoneNumber.length > 40) {
            // un-recognized, so don't format
            return rawPhoneNumber;
        } else {
            return formattedPhoneNumber;
        }
    }

})// eslint-disable-line semi
