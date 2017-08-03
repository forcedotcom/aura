define('modules-moduletest', ['x-test', 'engine'], function (_xTest, engine) {

function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.c("x-test", _xTest, {
        "slotset": {
            "$default$": [$api.d($cmp.test)]
        }
    })];
}

class Test extends engine.Element {
    constructor(...args) {
        var _temp;

        return _temp = super(...args), this.stringQuote = 'str"ing', this.stringDoubleQuote = "str'ing", this.stringBacktick = `key=${value}`, this.VALID_NAME_RE = /^([a-zA-Z]\w*):([a-zA-Z]\w*)$/, _temp;
    }

    render() {
        return tmpl;
    }

}
Test.publicProps = {
    stringQuote: {
        config: 0
    },
    stringDoubleQuote: {
        config: 0
    },
    stringBacktick: {
        config: 0
    },
    VALID_NAME_RE: {
        config: 0
    }
};

return Test;

});