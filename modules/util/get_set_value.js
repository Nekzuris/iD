// Like selection.property('value', ...), but avoids no-op value sets,
// which can result in layout/repaint thrashing in some situations.
/** @returns {string} */
export function utilGetSetValue(selection, value, shouldUpdate) {
    function setValue(value, shouldUpdate) {
        function valueNull() {
            delete this.value;
        }

        function valueConstant() {
            if (shouldUpdate(this.value, value)) {
                this.value = value;
            }
        }

        function valueFunction() {
            var x = value.apply(this, arguments);
            if (x === null || x === undefined) {
                delete this.value;
            } else if (shouldUpdate(this.value, x)) {
                this.value = x;
            }
        }

        return (value === null || value === undefined)
            ? valueNull : (typeof value === 'function'
            ? valueFunction : valueConstant);
    }

    function stickyCursor(func) {
        const supportedTypes = ['text', 'search', 'url', 'tel', 'password'];
        return function() {
            if (!supportedTypes.includes(this.type)) {
                return;
            }
            const cursor = { start: this.selectionStart, end: this.selectionEnd };
            func.apply(this, arguments);
            this.setSelectionRange(cursor.start, cursor.end);
        };
    }

    if (arguments.length === 1) {
        return selection.property('value');
    }

    if (shouldUpdate === undefined) {
        shouldUpdate = (a, b) => a !== b;
    }

    return selection.each(stickyCursor(setValue(value, shouldUpdate)));
}
