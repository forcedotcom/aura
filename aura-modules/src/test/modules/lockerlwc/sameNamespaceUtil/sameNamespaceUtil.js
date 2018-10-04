export function bark() {
    return { sound : 'woof'};
}

export class Dog {
    constructor() {
        this.name = 'Dog';
    }
}

Dog.prototype.bark = bark;

export const obj = {};