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
({
    /**
     * No truncate value means no truncation.
     */
    testTruncateNone: {
        attributes : {value: 'truncate me'},
        test: function(component){
            aura.test.assertEquals('truncate me', $A.test.getText(component.getElement()), "value not expected");
        }
    },

    /**
     * Truncating with ellipsis to 0 length will not truncate the value.
     */
    testTruncateZeroAttributeValue: {
        attributes : {value: 'truncate me', truncate: '0'},
        test: function(component){
            aura.test.assertEquals('truncate me', $A.test.getText(component.getElement()), "value not truncated as expected");
        }
    },

    /**
     * Truncating without ellipsis to 0 length will not truncate the value.
     */
    testTruncateZeroAttributeValueWithoutEllipsis: {
        attributes : {value: 'truncate me', truncate: '0', ellipsis: 'false'},
        test: function(component){
            aura.test.assertEquals('truncate me', $A.test.getText(component.getElement()), "value not truncated as expected");
        }
    },

    /**
     * Truncating with ellipsis 1 length will give 1 character and ellipsis.
     */
    testTruncateOneAttributeValue: {
        attributes : {value: 'truncate me', truncate: '1'},
        test: function(component){
            aura.test.assertEquals('t...', $A.test.getText(component.getElement()), "value not truncated as expected");
        }
    },

    /**
     * Truncating without ellipsis to 1 length will give 1 character.
     */
    testTruncateOneAttributeValueWithoutEllipsis: {
        attributes : {value: 'truncate me', truncate: '1', ellipsis: 'false'},
        test: function(component){
            aura.test.assertEquals('t', $A.test.getText(component.getElement()), "value not truncated as expected");
        }
    },

    /**
     * Truncating with ellipsis to 3 length will give 1 character and ellipsis.
     */
    testTruncateThreeAttributeValue: {
        attributes : {value: 'truncate me', truncate: '3'},
        test: function(component){
            aura.test.assertEquals('t...', $A.test.getText(component.getElement()), "value not truncated as expected");
        }
    },

    /**
     * Truncating without ellipsis to 3 length will give 3 characters.
     */
    testTruncateThreeAttributeValueWithoutEllipsis: {
        attributes : {value: 'truncate me', truncate: '3', ellipsis: 'false'},
        test: function(component){
            aura.test.assertEquals('tru', $A.test.getText(component.getElement()), "value not truncated as expected");
        }
    },

    /**
     * Truncating with ellipsis to 4 length will give 1 character and ellipsis.
     */
    testTruncateFourAttributeValue: {
        attributes : {value: 'truncate me', truncate: '4'},
        test: function(component){
            aura.test.assertEquals('t...', $A.test.getText(component.getElement()), "value not truncated as expected");
        }
    },

    /**
     * Truncating without ellipsis to 4 length will give 4 characters.
     */
    testTruncateFourAttributeValueWithoutEllipsis: {
        attributes : {value: 'truncate me', truncate: '4', ellipsis: 'false'},
        test: function(component){
            aura.test.assertEquals('trun', $A.test.getText(component.getElement()), "value not truncated as expected");
        }
    },

    /**
     * Truncating with ellipsis to value length will give value back without ellipsis.
     */
    testTruncateExactAttributeValue: {
        attributes : {value: 'truncate me', truncate: '11'},
        test: function(component){
            aura.test.assertEquals('truncate me', $A.test.getText(component.getElement()), "value shouldn't need truncating");
        }
    },

    /**
     * Truncating without ellipsis to value length will give value back without ellipsis.
     */
    testTruncateExactAttributeValueWithoutEllipsis: {
        attributes : {value: 'truncate me', truncate: '11', ellipsis: 'false'},
        test: function(component){
            aura.test.assertEquals('truncate me', $A.test.getText(component.getElement()), "value shouldn't need truncating");
        }
    },

    /**
     * Truncating with ellipsis to  >value length, but <(value length + ellipsis length), will give value back without ellipsis.
     */
    testTruncateEnoughAttributeValue: {
        attributes : {value: 'truncate me', truncate: '13'},
        test: function(component){
            aura.test.assertEquals('truncate me', $A.test.getText(component.getElement()), "value shouldn't need truncating");
        }
    },

    /**
     * Truncating with ellipsis to (value length + ellipsis length), will give value back without ellipsis.
     */
    testTruncateMoreThanEnoughAttributeValue: {
        attributes : {value: 'truncate me', truncate: '14'},
        test: function(component){
            aura.test.assertEquals('truncate me', $A.test.getText(component.getElement()), "value shouldn't need truncating");
        }
    },

    /**
     * Truncating with negative value will be ignored.
     */
    testTruncateNegativeAttributeValue: {
        attributes : {value: 'truncate me', truncate: '-1'},
        test: function(component){
            aura.test.assertEquals('truncate me', $A.test.getText(component.getElement()), "negative truncate value not ignored");
        }
    },

    /**
     * Truncating by word with ellipsis will truncate before the last word.
     */
    testTruncateByWordWithEllipsis: {
        attributes : {value: 'this word fits', truncate: '13', ellipsis: 'true', truncateByWord: 'true'},
        test: function(component){
            aura.test.assertEquals('this word...', $A.test.getText(component.getElement()), "value wasn't truncated");
        }
    },

    /**
     * Truncating by word with ellipsis where the length of the value (not counting the ellipsis) fits will not truncate the last word.
     */
    testTruncateByWordWithEllipsisExact: {
        attributes : {value: 'this word fits', truncate: '14', ellipsis: 'true', truncateByWord: 'true'},
        test: function(component){
            aura.test.assertEquals('this word fits', $A.test.getText(component.getElement()), "value shouldn't need truncating");
        }
    },

    /**
     * Truncating by word without ellipsis will truncate midway through the last word.
     */
    testTruncateByWordWithoutEllipsis: {
        attributes : {value: 'this word fits', truncate: '13', ellipsis: 'false', truncateByWord: 'true'},
        test: function(component){
            aura.test.assertEquals('this word', $A.test.getText(component.getElement()), "value wasn't truncated");
        }
    },

    /**
     * Truncating with empty value will be ignored.
     */
    testTruncateEmpty: {
        attributes : {value: 'truncate me', truncate: ''},
        test: function(component){
            aura.test.assertEquals('truncate me', $A.test.getText(component.getElement()), "empty truncate value not ignored");
        }
    }
})
