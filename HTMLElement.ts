interface HTMLElement {
    parents(selector: string)
}

HTMLElement.prototype.parents = function (selector) {
    let node = this;

    while (
        (node = node.parentElement) &&
        !((node.matches || node.matchesSelector).call(node, selector))
    );

    return node;
};
