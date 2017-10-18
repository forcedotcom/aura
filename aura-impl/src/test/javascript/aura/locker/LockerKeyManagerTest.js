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
Function.RegisterNamespace("Test.Aura.Locker");

[Fixture]
Test.Aura.Locker.LockerKeyManagerTest = function() {

	Mocks.GetMocks(Object.Global(), {
        "Proxy": function() {}
    })(function() {
    	[Import("aura-impl/src/main/resources/aura/locker/LockerKeyManager.js")]
    });

    [Fixture]
    function testSetKey() {

        [Fact]
        function testNoDefaultKey() {
            var thing = {};
            Assert.Undefined(ls_getKey(thing));
        }

        [Fact]
        function testSetKey() {
            var thing = {};
            ls_setKey(thing, "key");
            Assert.Equal("key", ls_getKey(thing));
        }

        [Fact]
        function testSetNullKeyThrows() {
            var thing = {};
            Assert.Throws(Error, function() {
                ls_setKey(thing, null);
            });
        }

        [Fact]
        function testSetKeyOnNullNoop() {
            var thing = null;
            ls_setKey(thing, "key");
            Assert.Undefined(ls_getKey(thing));
        }

        [Fact]
        function testSetKeyToSameValueNoError() {
            var from = {};
            ls_setKey(from, "key");
            ls_setKey(from, "key");
            Assert.True(true);
        }

        [Fact]
        function testSetKeyToDifferentValueThrows() {
            var from = {};
            ls_setKey(from, "key1");
            Assert.Throws(Error, function() {
                ls_setKey(from, "key2");
            });
        }
    }

    [Fixture]
    function testHasAccess() {

        [Fact]
        function testAccessNoKey() {
            var from = {};
            var to = {};
            Assert.True(ls_hasAccess(from, to));
        }

        [Fact]
        function testAccessSameKey() {
            var from = {};
            var to = {};
            ls_setKey(from, "key");
            ls_setKey(to, "key");
            Assert.True(ls_hasAccess(from, to));
        }

        [Fact]
        function testNoAccessFromKeyToNoKey() {
            var from = {};
            var to = {};
            ls_setKey(from, "key");
            Assert.False(ls_hasAccess(from, to));
        }

        [Fact]
        function testNoAccessFromNoKeyToKey() {
            var from = {};
            var to = {};
            ls_setKey(to, "key");
            Assert.False(ls_hasAccess(from, to));
        }

        [Fact]
        function testNoAccessDifferentKey() {
            var from = {};
            var to = {};
            ls_setKey(from, "key1");
            ls_setKey(to, "key2");
            Assert.False(ls_hasAccess(from, to));
        }
    }

    [Fixture]
    function testTrust() {

        [Fact]
        function testTrustFromNotKeyedNotThrow() {
            var from = {};
            var to = {};
            Assert.DoesNotThrow(Error, function() {
                ls_trust(from, to);
            });
        }

        [Fact]
        function testTrustFromKeyedHasAccess() {
            var from = {};
            var to = {};
            ls_setKey(from, "key");
            ls_trust(from, to);
            Assert.True(ls_hasAccess(from, to));
        }

        [Fact]
        function testTrustSameKeyHasAccess() {
            var from = {};
            var to = {};
            ls_setKey(from, "key");
            ls_setKey(to, "key");
            ls_trust(from, to);
            Assert.True(ls_hasAccess(from, to));
        }

        [Fact]
        function testTrustFromNotKeyedToKeyedNoop() {
            var from = {};
            var to = {};
            ls_setKey(to, "key");
            ls_trust(from, to);
            Assert.Equal("key", ls_getKey(to));
        }

        [Fact]
        function testTrustSameKeyHasAccess() {
            var from = {};
            var to = {};
            ls_setKey(from, "key");
            ls_setKey(to, "key");
            ls_trust(from, to);
            Assert.True(ls_hasAccess(from, to));
        }

        [Fact]
        function testTrustDifferentKeyThrows() {
            var from = {};
            var to = {};
            ls_setKey(from, "key");
            ls_setKey(to, "key2");
            Assert.Throws(Error, function() {
                ls_trust(from, to);
            });
        }
    }

    [Fixture]
    function testSetRef() {

        [Fact]
        function testSetRefNullNotThrow() {
            var raw = null;
            var st = {};
            Assert.DoesNotThrow(Error, function() {
                ls_setRef(st, raw, "key");
            });
        }

        [Fact]
        function testSetRefOnNullThrows() {
            var raw = {};
            var st = null;
            Assert.Throws(Error, function() {
                ls_setRef(st, raw, "key");
            });
        }

        [Fact]
        function testSetRefNullKeyThrows() {
            var raw = {};
            var st = {};
            Assert.Throws(Error, function() {
                ls_setRef(st, raw, null);
            });
        }

        [Fact]
        function testSetGetRefSameKey() {
            var raw = {};
            var st = {};
            ls_setRef(st, raw, "key");
            Assert.Equal(raw, ls_getRef(st, "key"));
        }

        [Fact]
        function testSetGetRefDifferentKeyThrows() {
            var raw = {};
            var st = {};
            ls_setRef(st, raw, "key1");
            Assert.Throws(Error, function() {
                ls_getRef(st, "key2");
            });
        }

        [Fact]
        function testSetRefOpaqueGetRef() {
            var raw = {};
            var st = {};
            ls_setRef(st, raw, "key", true);
            Assert.Equal(raw, ls_getRef(st, "key"));
        }

        [Fact]
        function testSetRefOpaqueGetRefSkipOpaqueThrows() {
            var raw = {};
            var st = {};
            ls_setRef(st, raw, "key", true);
            Assert.Throws(Error, function() {
                ls_getRef(st, "key", true);
            });
        }
    }

    [Fixture]
    function testUnwrap() {

        [Fact]
        function testUnwrapSameKey() {
            var from = {};
            var raw = {};
            var to = {};
            ls_setKey(from, "key");
            ls_setRef(to, raw, "key");
            Assert.Equal(raw, ls_unwrap(from, to));
        }

        [Fact]
        function testUnwrapDifferentKeyThrows() {
            var from = {};
            var raw = {};
            var to = {};
            ls_setKey(from, "key1");
            ls_setRef(to, raw, "key2");
            Assert.Throws(Error, function() {
                ls_unwrap(from, to);
            });
        }
    }

    [Fixture]
    function testCache() {

        [Fact]
        function testAddToCacheNoKeyThrows() {
            var st = {};
            var raw = {};
            Assert.Throws(Error, function() {
                ls_addToCache(raw, st, null);
            });
        }

        [Fact]
        function testAddToCacheNullRef() {
            var st = null;
            var raw = {};
            ls_addToCache(raw, st, "key");
            Assert.Equal(null, ls_getFromCache(raw, "key"));
        }

        [Fact]
        function testAddToCacheNoRawThrows() {
            var st = {};
            var raw = null;
            Assert.Throws(Error, function() {
                ls_addToCache(raw, st, "key");
            });
        }

        [Fact]
        function testAddGetToCacheSameKey() {
            var st = {};
            var raw = {};
            ls_addToCache(raw, st, "key");
            Assert.Equal(st, ls_getFromCache(raw, "key"));
        }

        [Fact]
        function testUnwrapDifferentKeyUndefined() {
            var st = {};
            var raw = {};
            ls_addToCache(raw, st, "key1");
            Assert.Undefined(ls_getFromCache(raw, "key2"));
        }
    }}