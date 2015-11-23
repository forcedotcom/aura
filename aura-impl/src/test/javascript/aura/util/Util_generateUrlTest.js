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
Function.RegisterNamespace("Test.Aura.Util");

[Fixture]
Test.Aura.Util.generateUrl = function() {
    var Aura = {Utils:{
        Style: function() {},
        SizeEstimator: function() {},
        SecureFilters:{}
    }};

    var targetUtil;
    Mocks.GetMocks(Object.Global(), {
        Aura: Aura,
        navigator:{userAgent:''},
        window:Object.Global(),
        document:{createDocumentFragment:function() {}},
        Json:function() {}
    })(function () {
        [Import("aura-impl/src/main/resources/aura/util/Util.js")]
        targetUtil = new Aura.Utils.Util();
    });

    [Fixture]
    function generateUrl() {

        [Fact]
        function addQueryParamWithEmptyUrl() {
            var url = "";
            var params = { "key": "value" };
            var expected = "?key=value";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function addQueryParam() {
            var url = "http://salesforce.com";
            var params = { "key": "value" };
            var expected = "http://salesforce.com?key=value";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function addMultipleQueryParams() {
            var url = "http://salesforce.com";
            var params = { "key": "value", "key2": "value2" };
            var expected = "http://salesforce.com?key=value&key2=value2";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function addQueryParamWithUrlHasParams() {
            var url = "http://salesforce.com?key=value";
            var params = { "key2": "value2" };
            var expected = "http://salesforce.com?key=value&key2=value2";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function updateQueryParams() {
            var url = "http://salesforce.com?key=value&key2=value2";
            var params = { "key": "NEWVALUE", "key2": "NEWVALUE2" };
            var expected = "http://salesforce.com?key=NEWVALUE&key2=NEWVALUE2";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function encodeQueryParams() {
            var url = "http://salesforce.com?key=value";
            var params = { "key": "value=valid" };
            var expected = "http://salesforce.com?key=value%3Dvalid";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function removeQueryParams() {
            var url = "http://salesforce.com?key=key&key2=key2";
            var params = { "key": "value", "key2": undefined };
            var expected = "http://salesforce.com?key=value";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function persistsHashTokensWhenUpdatingQueryParam() {
            var url = "/path/page.apexp?key=value#Id=SOMEID";
            var params = { "key": "NEWVALUE" };
            var expected = "/path/page.apexp?key=NEWVALUE#Id=SOMEID";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function persistsHashTokenWhenAddingQueryParam() {
            var url = "/path/page.apexp#Id=SOMEID";
            var params = { "key": "NEWVALUE" };
            var expected = "/path/page.apexp?key=NEWVALUE#Id=SOMEID";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function persistsMultiHashTokensWhenAddingQueryParam() {
            var url = "/path/page.apexp#hash1#hash2";
            var params = { "key": "NEWVALUE" };
            var expected = "/path/page.apexp?key=NEWVALUE#hash1#hash2";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function addParamWhenUrlHasParamAndHash() {
            var url = "/path/page.html?param=foo#hash";
            var params = { "key": "value"};
            var expected = "/path/page.html?param=foo&key=value#hash";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function addParamWhenUrlHasHashBeforeQueryString() {
            var url = "/path/page.html#path?param=foo";
            var params = { "key": "value"};
            var expected = "/path/page.html#path?param=foo&key=value";

            var actual = targetUtil.generateUrl(url, params);

            Assert.Equal(expected, actual);
        }
    }
}
