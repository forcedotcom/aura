$A.componentService.addModule('modules:classandtemplate', ['a:b'], function (_a$b) { 'use strict';

const memoized = Symbol();
var _tmpl = function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {
            class: "bar"
        },
        [$api.h(
            "ul",
            {
                class: $cmp.myList
            },
            $api.f([$api.v(
                _a$b,
                {},
                ["first"]
            ), $api.i($cmp.items, function (item) {
                return $api.h(
                    "li",
                    {
                        class: "item"
                    },
                    [$api.s(item)]
                );
            }), $api.s($cmp.last)])
        )]
    )];
};
const templateUsedIds = ["myList", "items", "last"];

const DefaultMinValue = 5;
const DefaultMaxValue = 50;

class Bar {

    constructor() {
        this.counter = 0;
        this.itemClassName = 'item';
        this.data = [];
    }

    broza(x) {
        return x;
    }

    publicMethod() {
        console.log(`test`); // back-tick on purpose to test handling of back-ticks
    }

    handleClick() {
        this.counter += 1;
        const newData = [];
        this.data = newData;
        console.log('clicked');
    }

    render() {
        return _tmpl;
    }

}
Bar.tagName = 'modules-bar';
Bar.publicProps = {
    min: DefaultMinValue,
    max: DefaultMaxValue,
    label: null,
    title: null
};
Bar.publicMethods = ['publicMethod'];
Bar.templateUsedIds = templateUsedIds;

return Bar;

});
