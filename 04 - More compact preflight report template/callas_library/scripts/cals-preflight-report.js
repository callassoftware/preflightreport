//-------------------------------------------------------------------------------------------------
// Support functions specific to the preflight report template.
//
// Dependencies: 
// - jQuery
// - cals-units.js
// - cals-xml-report.js
//-------------------------------------------------------------------------------------------------
// Author: David van Driessche
// Copyright: Copyright © 2018 - Four Pees
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// INFORMATION ABOUT PAGES
//-------------------------------------------------------------------------------------------------

// Gets the number of pages in the preflighted document
//
function getNumPages() {

	return cals_doc_info.docs[0].num_pages;
}


// Runs over all pages and tries to summarize the information about the trimbox in a short text
//
function getTrimSizeSummary() {

	// Get information about the width and height of all pages from the XML report
	var theTrimboxes = xmlGetPageboxDimensionsForAllPages( xmlEnumPageboxes.trimbox );

	// Classify the pages that are the same
	var theTrimboxesFound = [];
	for (var theIndex = 0; theIndex < theTrimboxes.length; theIndex++) {

		// Take the current trimbox
		var theCurrentTrimbox = theTrimboxes[theIndex];

		// Run over all already found trimboxes
		var theTrimboxFoundIndex = -1;
		for (var theFoundIndex = 0; theFoundIndex < theTrimboxesFound.length; theFoundIndex++) {
			if ((theCurrentTrimbox.width==theTrimboxesFound[theFoundIndex].width) && (theCurrentTrimbox.height==theTrimboxesFound[theFoundIndex].height)) {
				theTrimboxFoundIndex = theFoundIndex;
				theTrimboxesFound[theTrimboxFoundIndex].pages.push(theIndex);
				break;
			}	
		}

		// If we didn't find it, add a new one
		if (theTrimboxFoundIndex == -1) {
			theTrimboxesFound.push( { width: theCurrentTrimbox.width,
						  height: theCurrentTrimbox.height,
						  pages: [ theIndex ],
						  name: null } );
		}
	}

	// Run over all found things and name them
	for (var theIndex = 0; theIndex < theTrimboxesFound.length; theIndex++) {

		// Convert to mm
		var theWidth = unitConvertFromPoints( theTrimboxesFound[theIndex].width, unitUnits.mm );
		var theHeight = unitConvertFromPoints( theTrimboxesFound[theIndex].height, unitUnits.mm );

		// Create formatted string
		theTrimboxesFound[theIndex].name = convertToStandardSizeIfPossible( theWidth, theHeight );		
	}

	// Create a return value
	if (theTrimboxesFound.length == 1) {
		return theTrimboxesFound[0].name;
	} else if (theTrimboxesFound.length == 2) {
		return theTrimboxesFound[0].name + " & " + theTrimboxesFound[1].name;
	} else if (theTrimboxesFound.length == 3) {
		return theTrimboxesFound[0].name + ", " + theTrimboxesFound[1].name + " & " + theTrimboxesFound[2].name;
	} else {
		return theTrimboxesFound[0].name + ", " + theTrimboxesFound[1].name + ", " + theTrimboxesFound[2].name + "...";
	}
}



//-------------------------------------------------------------------------------------------------
// INFORMATION ABOUT RESULTS
//-------------------------------------------------------------------------------------------------

// Returns the number of errors during preflight
//
function getNumberOfErrors() {
	return cals_res_info.errors;
}

// Returns an array with all errors, warnings or hits in all steps of the profile
//
function getHits() {

	// Start with nothing found
	var theResult = [];

	// Get the steps objects
	var theSteps = cals_res_info.steps;
	for (var theStepIndex = 0; theStepIndex < theSteps.length; theStepIndex++) {

		// Get the hits array
		var theHits = theSteps[theStepIndex].hits;
		if ($.isArray(theHits)) {

			for (var theHitIndex = 0; theHitIndex < theHits.length; theHitIndex++) {
				theResult.push( theHits[theHitIndex] );
			}
		}
	}

	// Return the result
	return theResult;
}

// Returns an array with all fixups in all steps of the profile
function getFixups() {

	// Start with nothing found
	var theResult = [];

	// Get the steps objects
	var theSteps = cals_res_info.steps;
	for (var theStepIndex = 0; theStepIndex < theSteps.length; theStepIndex++) {

		// Get the fixups array
		var theFixups = theSteps[theStepIndex].fixups;
		if ($.isArray(theFixups)) {

			for (var theFixupIndex = 0; theFixupIndex < theFixups.length; theFixupIndex++) {
				theResult.push( theFixups[theFixupIndex] );
			}
		}
	}

	// Return the result
	return theResult;
}



//-------------------------------------------------------------------------------------------------
// WORKING WITH TRANSLATIONS
//-------------------------------------------------------------------------------------------------

function translate() {

	// Translate all necessary elements
	$( ".translatable" ).each(function(){
		
		var theKey = $(this).text();
		if (cals_dict[theKey] != undefined) {
			var theValue = cals_dict[theKey];
			$(this).text( theValue );
		}
	});
}



//-------------------------------------------------------------------------------------------------
// UTILITY FUNCTIONS
//-------------------------------------------------------------------------------------------------

// Finds out whether two real numbers are closer together than a 0.01 tolerance
//
function isCloseToEqual( inA, inB) {
	return (Math.abs(inA - inB) < 0.01);
}

// Converts incoming measurements to either a standard string or a XXX x YYY mm string
//
function convertToStandardSizeIfPossible( inWidth, inHeight ) {

	if (isCloseToEqual(inWidth, 210) && isCloseToEqual(inHeight, 297)) {
		return "A4 portrait";

	} else if (isCloseToEqual(inWidth, 297) && isCloseToEqual(inHeight, 210)) {
		return "A4 landscape";

	} else if (isCloseToEqual(inWidth, 148) && isCloseToEqual(inHeight, 210)) {
		return "A5 portrait";

	} else if (isCloseToEqual(inWidth, 210) && isCloseToEqual(inHeight, 148)) {
		return "A5 landscape";

	} else if (isCloseToEqual(inWidth, 297) && isCloseToEqual(inHeight, 420)) {
		return "A3 portrait";

	} else if (isCloseToEqual(inWidth, 420) && isCloseToEqual(inHeight, 297)) {
		return "A3 landscape";

	} else if (isCloseToEqual(inWidth, 215.9) && isCloseToEqual(inHeight, 279.4)) {
		return "Letter portrait";

	} else if (isCloseToEqual(inWidth, 279.4) && isCloseToEqual(inHeight, 215.9)) {
		return "Letter landscape";

	} else if (isCloseToEqual(inWidth, 215.9) && isCloseToEqual(inHeight, 355.6)) {
		return "Legal portrait";

	} else if (isCloseToEqual(inWidth, 355.6) && isCloseToEqual(inHeight, 215.9)) {
		return "Legal landscape";

	} else {
		return unitFormatWithUnit( inWidth, unitUnits.mm, 0 ) + " x " + unitFormatWithUnit( inHeight, unitUnits.mm, 0 );

	}
}

// Returns a correctly formatted human readable size string. Originates here:
// https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/10420404
//
function humanFileSize(bytes, si) {
	var thresh = si ? 1000 : 1024;
	if(Math.abs(bytes) < thresh) {
	    return bytes + ' B';
	}
	var units = si
	    ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
	    : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
	var u = -1;
	do {
	    bytes /= thresh;
	    ++u;
	} while(Math.abs(bytes) >= thresh && u < units.length - 1);
	return bytes.toFixed(1)+' '+units[u];
    }
