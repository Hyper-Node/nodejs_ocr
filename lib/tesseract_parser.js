//Standard dependencies 
var fs = require('fs');

//Additional 3rd-party dependencies
var tesseract = require('../node_modules_custom/node-tesseract');
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


/**
 * Options description 
 * Page segmentation modes:
  0    Orientation and script detection (OSD) only.
  1    Automatic page segmentation with OSD.
  2    Automatic page segmentation, but no OSD, or OCR.
  3    Fully automatic page segmentation, but no OSD. (Default)
  4    Assume a single column of text of variable sizes.
  5    Assume a single uniform block of vertically aligned text.
  6    Assume a single uniform block of text.
  7    Treat the image as a single text line.
  8    Treat the image as a single word.
  9    Treat the image as a single word in a circle.
 10    Treat the image as a single character.
 11    Sparse text. Find as much text as possible in no particular order.
 12    Sparse text with OSD.
 13    Raw line. Treat the image as a single text line,
                        bypassing hacks that are Tesseract-specific.
OCR Engine modes:
  0    Original Tesseract only.
  1    Neural nets LSTM only.
  2    Tesseract + LSTM.
  3    Default, based on what is available.
 */
var options = { //Add lstm add tesseract docs 
	l: 'deu',
    psm: 6,   //page segmentation modes see above comment for numbers
    oem: 0,
    binary: '/usr/local/bin/tesseract', //checked this 
    printCmd: true,      //printout the used tesseract command
    printParameters: false
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