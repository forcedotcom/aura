define('modules-moduletest', ['x-test'], function (_xTest) {
    'use strict';

    function tmpl($api, $cmp, $slotset, $ctx) {
        return [$api.c("x-test", _xTest, {
            slotset: {
                $default$: [$api.d($cmp.test)]
            }
        })];
    }
    tmpl.ids = ["test"];

    class Test {
        constructor() {
            this.stringQuote = 'str"ing';
            this.stringDoubleQuote = "str'ing";
            this.stringBacktick = `key=${value}`;
            this.VALID_NAME_RE = /^([a-zA-Z]\w*):([a-zA-Z]\w*)$/;
        }

        render() {
            return tmpl;
        }

    }
    Test.publicProps = {
        stringQuote: 1,
        stringDoubleQuote: 1,
        stringBacktick: 1,
        VALID_NAME_RE: 1
    };

    return Test;
});