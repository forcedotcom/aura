define('modules-moduletest', ['x-test'], function (_xTest) {

function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.c("x-test", _xTest, {
        "slotset": {
            "$default$": [$api.d($cmp.test)]
        }
    })];
}

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
    stringQuote: {
        config: 0,
        type: "string"
    },
    stringDoubleQuote: {
        config: 0,
        type: "string"
    },
    stringBacktick: {
        config: 0,
        type: "undefined"
    },
    VALID_NAME_RE: {
        config: 0,
        type: "undefined"
    }
};

return Test;

});
