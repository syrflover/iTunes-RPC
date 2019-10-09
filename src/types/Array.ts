declare global {
    // tslint:disable-next-line: interface-name
    interface Array<T> {
        clear(): T[];
    }
}

Array.prototype.clear = function() {
    while (this.length) {
        this.pop();
    }
    return this;
};

export = global;
