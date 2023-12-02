// Function to convert snake_case to Title Case
function toTitleCase(snakeStr) {
    return snakeStr
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to transform object keys
function transformObjectKeys(obj) {
    return Object.keys(obj).reduce((acc, key) => {
        const transformedKey = toTitleCase(key);
        acc[transformedKey] = obj[key];
        return acc;
    }, {});
}

// Extend console
console.tableWithReadableHeaders = (obj) => {
    if (Array.isArray(obj)) {
        // Transform an array of objects
        const transformedArray = obj.map(transformObjectKeys);
        console.table(transformedArray);
    } else {
        // Transform a single object
        console.table([transformObjectKeys(obj)]);
    }
};
