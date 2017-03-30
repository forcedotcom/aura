define('modules-moduletest', ['x-test'], function (_xTest) { 'use strict';

function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.c(
        "x-test",
        _xTest,
        {
            slotset: {
                $default$: [$api.s($cmp.test)]
            }
        }
    )];
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
    stringQuote: 'str"ing',
    stringDoubleQuote: "str'ing",
    stringBacktick: `key=${value}`,
    VALID_NAME_RE: /^([a-zA-Z]\w*):([a-zA-Z]\w*)$/
};

return Test;

});