$A.componentService.addModule('modules:moduletest', ['x-test'], function (_xTest) { 'use strict';

const memoized = Symbol('memoize');
var _tmpl = function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.c(
        "x-test",
        _xTest,
        {
            slotset: {
                $default$: [$api.s($cmp.test)]
            }
        }
    )];
};
const templateUsedIds = ["test"];

class Test {
    render() {
        return _tmpl;
    }

}
Test.tagName = "modules-moduletest";
Test.publicProps = {
    stringQuote: 'str"ing',
    stringDoubleQuote: "str'ing",
    stringBacktick: `key=${value}`,
    VALID_NAME_RE: /^([a-zA-Z]\w*):([a-zA-Z]\w*)$/
};
Test.templateUsedIds = templateUsedIds;

return Test;

});
