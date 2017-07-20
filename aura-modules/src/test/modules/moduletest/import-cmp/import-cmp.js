import * as engine from 'engine';
import { Element } from 'engine';
// eslint-disable-next-line raptor/no-compat
import aura from 'aura';
import storage from 'aura-storage';

export default class ImportCmp extends Element {
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
