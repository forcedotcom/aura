import { api, Element } from 'engine';
// eslint-disable-next-line lwc/no-compat
import aura from 'aura';
// eslint-disable-next-line lwc/no-compat-module-storage
import storage from 'aura-storage';

export default class ImportCmp extends Element {
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
}
