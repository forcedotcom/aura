export function getHost(node) {
    if (!node) {
        throw new Error('Attempting to process a falsy value');
    }
    let parentNode = node;
    while (parentNode && !isShadowRoot(parentNode)) {
        node = parentNode;
        parentNode = node.parentNode;
    }
    return parentNode? parentNode.host : parentNode;
}

function isShadowRoot(node) {
    return node instanceof ShadowRoot;
}