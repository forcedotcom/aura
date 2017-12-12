import * as engine from 'engine';
// eslint-disable-next-line lwc/no-compat
import aura from 'aura';
// eslint-disable-next-line lwc/no-compat-module-storage
import storage from 'aura-storage';

export default class ImportCmp extends engine.Element {
    // @api functions are called from aura component moduleTest:importTest

    @api
    getEngine(f) {
        f(engine);
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
