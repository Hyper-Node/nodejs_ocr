//Standard dependencies 
var fs = require('fs');

//Additional 3rd-party dependencies
var tesseract = require('node-tesseract');
var dotenv = require('dotenv');

//Load System Environment variables stored in .env file in root folder 
dotenv.config();


// Recognize text of any language in any format
/*
tesseract.process(__dirname + '/path/to/image.jpg',function(err, text) {
	if(err) {
		console.error(err);
	} else {
		console.log(text);
	}
});
*/

// Recognize German text in a single uniform block of text and set the binary path

var options = {
	l: 'deu',
	psm: 6,
	binary: '/usr/local/bin/tesseract' //checked this 
};



function parseFile(fileOfPicture,outname,failed,callbackDone){
    try{
        tesseract.process(fileOfPicture, options, function(err, text) {
     
            if(err) {
                //Push errors to error stack and then call done
                var errorMessage = new String("Tesseract-Parsing of File",fileOfPicture," failed with error:",err);
                console.error(errorMessage);
                failed.push(errorMessage);
                callbackDone();
            }else {
                //Save output and then call done
                console.log("Tesseract-Parsing of File",fileOfPicture," succeeded");
                console.log("Saving output to",outname);
     
                //outname - thats how it's content should look:
                //"output/media/sf_firmprofiles/many_years_firmprofiles/short/twoprof/one.jpg.txt"    
                fs.writeFile(outname, text, function(err){
                    if(err){
                        console.error("Error saving file",err);
                    }
                    callbackDone();
                });                
            }
        });
    }catch(ex){
        //Push exceptions to errorstack and then call done
        var exceptionMessage = "Tesseract-Parsing of File"+fileOfPicture+" failed with exception:";
        console.error(exceptionMessage,ex);
        failed.push([exceptionMessage,ex]);
        callbackDone();
    }
}


module.exports = {
    parseFile
}