var path = require('path');

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


/**
 * adds the defined extension as second to the last file extension to the file in filepath,
 * condition is that the extension is not already included in the input-files' extension,
 * in this case, the input-filepath is returned unmodified.
 * 
 * example: filepath: '/bin/file.txt'   extension: 'gt'  returned value:  '/bin/file.gt.txt'
 * @param {string} filepath - directory name and filename of the file to check
 * @param {string} extension - extension which is added as forelast extension to the file
 * @returns {string} modified filepath
 */
function addForelastExtensionToFilepath(filepath,extension){
    var filename = path.basename(filepath);
    var dirname  = path.dirname(filepath);
    if(!extension){
        console.log("No extension provided, returning plain filepath");
        return filepath;
    }
    //If the filepath hasn't got ground truth
    var matchstr = "\."+extension+"\.";
    var matchRegexp = new RegExp(matchstr);
    var fnamematchres = filename.match (matchRegexp);
    if(!fnamematchres){
        var filenamesplit = filename.split('.');

        var filenameMerged ="";
        //Cover special case no ending extension in filepath 
        if(filenamesplit.length==1) filenameMerged=filenamesplit[0]+"."+extension;
        //Add the .gt.
        for(var i=0;i<filenamesplit.length;i++){
            if(i!=filenamesplit.length-1){
                filenameMerged = filenameMerged+filenamesplit[i]+".";
                if(i==filenamesplit.length-2){
                    filenameMerged = filenameMerged+extension+".";
                }
            }else{
                filenameMerged = filenameMerged + filenamesplit[i];
            }
        }
        filepath = dirname+"/"+filenameMerged;
    }
    return filepath;

}


function replaceFileExtension(filepath,newExtension){
    var filename = path.parse(filepath).name;
    var dirname = path.parse(filepath).dir;
    var newPath = path.join(dirname,filename)+newExtension;
    return newPath;
}
module.exports ={
    objectFactory,
    addForelastExtensionToFilepath,
    replaceFileExtension
}