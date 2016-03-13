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


function classNamesLibrary () {  // eslint-disable-line no-unused-vars
    var hasOwn = {}.hasOwnProperty;
    var SPACE = /\s+/;

    function _parseArray (resultSet, array) {
        var length = array.length;

        for (var i = 0; i < length; ++i) {
            _parse(resultSet, array[i]); // eslint-disable-line no-use-before-define
        }
    }


    function _parseNumber (resultSet, num) {
        resultSet[num] = true;
    }

    function _parseObject (resultSet, object) {
        for (var k in object) {
            if (hasOwn.call(object, k)) {
                if (object[k]) {
                    resultSet[k] = true;
                } else {
                    delete resultSet[k];
                }
            }
        }
    }

    function _parseString (resultSet, str) {
        var array = str.split(SPACE);
        var length = array.length;

        for (var i = 0; i < length; ++i) {
            resultSet[array[i]] = true;
        }
    }

    function _parse (resultSet, arg) {
        if (!arg) { return; }
        var argType = typeof arg;

        // 'foo bar'
        if (argType === 'string') {
            _parseString(resultSet, arg);

            // ['foo', 'bar', ...]
        } else if (Array.isArray(arg)) {
            _parseArray(resultSet, arg);

            // { 'foo': true, ... }
        } else if (argType === 'object') {
            _parseObject(resultSet, arg);

            // '130'
        } else if (argType === 'number') {
            _parseNumber(resultSet, arg);
        }
    }

    function _classNames () {
        var classSet = {};
        _parseArray(classSet, arguments);

        var list = [];

        for (var k in classSet) {
            if (hasOwn.call(classSet, k) && classSet[k]) {
                list.push(k);
            }
        }

        return list.join(' ');
    }


    return {
        ObjectToString : _classNames
    };
}