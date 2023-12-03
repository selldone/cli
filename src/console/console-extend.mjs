// Function to convert snake_case to Title Case
function toTitleCase(snakeStr) {
    return snakeStr
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to transform object keys
function transformObjectKeys(obj, filter) {
    return Object.keys(obj).filter(i => !filter || filter.includes(i)).reduce((acc, key) => {
        const transformedKey = toTitleCase(key);

        if (key.endsWith('_at')) {
            try {
                if (!obj[key]) {
                    acc[transformedKey] = null;
                } else {
                    let date = new Date(obj[key]);
                    acc[transformedKey] = date.getFullYear() + '/' +
                        (date.getMonth() + 1) + '/' +
                        date.getDate() + ' ' +
                        date.getHours() + ':' +
                        date.getMinutes();
                }
            } catch (e) {

            }

        } else {
            acc[transformedKey] = obj[key];
        }

        return acc;
    }, {});
}

// Extend console
console.tableWithReadableHeaders = (obj, filter) => {
    if (Array.isArray(obj)) {
        // Transform an array of objects
        const transformedArray = obj.map(x => transformObjectKeys(x, filter));
        console.table(transformedArray);
    } else {
        // Transform a single object
        console.table([transformObjectKeys(obj, filter)]);
    }
};
