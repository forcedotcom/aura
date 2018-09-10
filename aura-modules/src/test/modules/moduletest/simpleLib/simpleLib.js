import { hasModule } from "aura";

export function log(m) {
    console.log('log: ' + m); // eslint-disable-line no-console
}

export function identity(value) {
    return value;
}

export function hasModuleDefinition(module) {
    return hasModule(module);
}