import { api, Element } from 'engine';
// eslint-disable-next-line lwc/no-compat
import aura from 'aura';
// eslint-disable-next-line lwc/no-compat-module-storage
import storage from 'aura-storage';
import { identity } from 'moduletest-simple-lib';

export default class ImportCmp extends Element {
    state = {
        libImport: identity('expected'),
    };

    // @api functions are called from aura component moduleTest:importTest
    @api
    getElement(f) {
        f(Element);
    }

    @api
    getAura(f) {
        f(aura);
    }

    @api
    getAuraStorage(f) {
        f(storage);
    }

    @api
    getLibImport(f) {
        f(this.state.libImport);
    }
}
