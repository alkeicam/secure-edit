function keepProperties(jsonObject, propertiesToRemove) {
    if (typeof jsonObject !== 'object' || typeof propertiesToRemove !== 'string') {
        throw new Error('Invalid input. Expected JSON object and a comma-separated string of properties to remove.');
    }

    const propertiesArray = propertiesToRemove.split(',').map(prop => prop.trim());

    for (let key in jsonObject) {
        if (!propertiesArray.includes(key)) {
            delete jsonObject[key];
        }
    }

    return jsonObject;
}

// makes sure that if any of the arguments is an object then insecure properties are removed before passing to target function, it also makes deep copy of the modified object arguments
function secure(func, secureProperties) {    
    return function() {
        // make arguments 'secure'
        const secureArguments = [...arguments].map(item=>{
            if(typeof item == 'object'){
                const copyOf = JSON.parse(JSON.stringify(item))
                return keepProperties(copyOf, secureProperties)
            }else{
                return item;
            }            
        })        
        let result = func.call(this, ...secureArguments); // "this" is passed correctly now        
        return result;
    };
}

module.exports = {
    secureDecorator: secure
}

