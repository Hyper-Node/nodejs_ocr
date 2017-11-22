/**
 * Creates a new instance of a json-object defined in
 * base object and adds all properties of the changes 
 * object to it 
 * @param {object} baseObject - 'parent' object content which gets instantiated 
 * @param {object} changes - key-value pairs which are added to the object
 * @returns {object} - new instance of baseObject with modified content
 */
function objectFactory(baseObject,changes){
    var objLocal = Object.create(baseObject);
    if(!changes)return objLocal;
    for (var key in changes) {
        if (changes.hasOwnProperty(key)) {
            //Overwrite or add defined property
            objLocal[key] = changes[key];
        }
    }
    return objLocal;
}



module.exports ={
    objectFactory
}