// Utilities for DOM manipulation
export const findEls = (sel, root = document) => Array.from(root.querySelectorAll(sel));