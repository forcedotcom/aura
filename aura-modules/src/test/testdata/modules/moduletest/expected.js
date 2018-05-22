define('modules-moduletest', ['x-test', 'engine'], function (_xTest, engine) {

const style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic,
    c: api_custom_element
  } = $api;

  return [api_custom_element("x-test", _xTest, {
    key: 1,
    "slotset": {
      "$default$": [api_dynamic($cmp.test)]
    }
  })];
}

if (style) {
    tmpl.token = 'modules-moduletest_moduletest';

    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'modules-moduletest_moduletest';
    style$$1.textContent = style('modules-moduletest', 'modules-moduletest_moduletest');
    document.head.appendChild(style$$1);
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
Test.style = tmpl.style;

return Test;

});
