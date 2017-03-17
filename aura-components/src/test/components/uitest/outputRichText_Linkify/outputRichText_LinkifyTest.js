/**
 * Created by abakhtiari on 2016-02-17.
 */
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
    testWWWLink:{
        attributes : {textValue: 'visit www.salesforce.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://www.salesforce.com\"");
        }
    },

    testNoWWWLink:{
        attributes : {textValue: 'visit salesforce.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://salesforce.com\"");
        }
    },

    testHttpLink:{
        attributes : {textValue: 'visit http://salesforce.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://salesforce.com\"");
        }
    },

    testHttpWWWLink:{
        attributes : {textValue: 'visit http://www.salesforce.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://www.salesforce.com\"");
        }
    },

    testHttpsLink:{
        attributes : {textValue: 'visit https://www.salesforce.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"https://www.salesforce.com\"");
        }
    },

    testNoHttpNoWWWLink:{
        attributes : {textValue: 'visit salesforce.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://salesforce.com\"");
        }
    },

    testFtpLink:{
        attributes : {textValue: 'visit ftp://user:password@example.com/pub/file.txt for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"ftp://user:password@example.com/pub/file.txt\"");
        }
    },

    testComDomain:{
        attributes : {textValue: 'visit salesforce.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://salesforce.com\"");
        }
    },

    testOtherDomain:{
        attributes : {textValue: 'visit www.bbc.co.uk for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://www.bbc.co.uk\"");
        }
    },

    testQueryParams:{
        attributes : {textValue: 'visit www.salesforce.com/sfdc?attributes=1234#work for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://www.salesforce.com/sfdc?attributes=1234#work\"");
        }
    },

    testMailLink:{
        attributes : {textValue: 'contact dude@aura.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"mailto:dude@aura.com\"");
        }
    },

    testIPAddressLink:{
        attributes : {textValue: 'visit http://152.1.1.255 for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://152.1.1.255\"");
        }
    },

    testDomainAndPortLink:{
        attributes : {textValue: 'visit http://user.salesforce.com:8080 for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://user.salesforce.com:8080\"");
        }
    },

    testIPAddressAndPortLink:{
        attributes : {textValue: 'visit http://127.0.0.1:9090 for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://127.0.0.1:9090\"");
        }
    },

    testAnchorLink:{
        attributes : {textValue: 'visit https://en.wikipedia.org/wiki/Salesforce.com#Lightning for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"https://en.wikipedia.org/wiki/Salesforce.com#Lightning\"");
        }
    },

    testMultipleLinks:{
        attributes : {textValue: 'visit www.salesforce.com/sfdc?attributes=1234#work or google.com, or go to \\\\Server\\path or contact dude@aura.com for more info'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://www.salesforce.com/sfdc?attributes=1234#work\"");
            this.assertLinksPresent(cmp, "href=\"http://google.com\"");
            this.assertLinksPresent(cmp, "href=\"mailto:dude@aura.com\"");
        }
    },

    testAnchorInText:{
        attributes : {textValue: 'visit <a href="http://www.bbc.co.uk" target="_blank">BBC</a> or www.salesforce.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "href=\"http://www.bbc.co.uk\"", false);
            this.assertLinksPresent(cmp, "href=\"http://www.salesforce.com\"", false);
            // make sure the href in the link isn't linkified
            this.assertTextNotPresent(cmp, "href=\"&lt;a href=\"");
        }
    },

    testImgInText:{
        attributes : {textValue: 'visit <img src="http://www2.sfdcstatic.com/common/assets/img/logo-tag-company.png"/> or www.salesforce.com for more details'},
        test: function(cmp){
            this.assertLinksPresent(cmp, "src=\"http://www2.sfdcstatic.com/common/assets/img/logo-tag-company.png\"", false);
            this.assertLinksPresent(cmp, "href=\"http://www.salesforce.com\"", false);
            // make sure the href in the link isn't linkified
            this.assertTextNotPresent(cmp, "src=\"&lt;a href=\"");
        }
    },

    testNonString : {
        attributes : {textValue: false},
        test: [function(cmp) {
        		   this.assertLinksPresent(cmp, "false");
        	   },
        	   function(cmp) {
        		   cmp.set('v.textValue', true);
        		   this.assertLinksPresent(cmp, "true");
        	   }
        ]
    },

    assertLinksPresent: function(cmp, hrefText, checkValue) {
        $A.test.addWaitForWithFailureMessage(true,
            function() {
                var htmlValue = cmp.find("richTextComp").getElement().innerHTML;
                return $A.test.contains(htmlValue, hrefText);
            }, "couldn't find " + hrefText + " in: "  + cmp.find("richTextComp").getElement().innerHTML,
            function() {
                // The following assertion wouldn't work if the text contains html elements
                if (checkValue) {
                    var textValue = $A.test.getText(cmp.find("richTextComp").getElement());
                    $A.test.assertEquals(textValue, cmp.get("v.textValue"));
                }
            }
        )
    },

    assertTextNotPresent: function(cmp, text) {
        $A.test.addWaitForWithFailureMessage(true,
            function() {
                var htmlValue = cmp.find("richTextComp").getElement().innerHTML;
                return !$A.test.contains(htmlValue, text);
            }, "Found " + text + " in: "  + cmp.find("richTextComp").getElement().innerHTML)
    }

})// eslint-disable-line semi
