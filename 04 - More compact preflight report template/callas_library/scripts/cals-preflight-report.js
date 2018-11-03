//-------------------------------------------------------------------------------------------------
// Support functions specific to the preflight report template.
//
// Dependencies: 
// - jQuery
//-------------------------------------------------------------------------------------------------
// Author: David van Driessche
// Copyright: Copyright © 2018 - Four Pees
//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// FILLING IN PREFLIGHT INFORMATION IN THE HTML
//-------------------------------------------------------------------------------------------------

// Given the page index for a page (0-based), sets the correct URL to inElement.
// Example: updatePreviewImage( "#preview_image", 0 )
// 
// inElement: a jQuery compatible element identifier
// inPage: the (0-based) page number for the page you're interested in
//
function updatePreviewImage( inElement, inPage ) {
	$(inElement).attr("src", cals_doc_info.docs[0].pages[0].page_img);
}

// Looks for elements with specific names and replaces their value with the information provided by
// pdfToolbox in the cals_params file or in the XML report file. This function fills elements with
// the following classes:
// - params_document_name
// - params_number_of_pages
// - params_summary_trim_size
// - params_profile_name
// - params_preflighted_when_by
// - params_summary_result
// - params_file_size
// - params_pdf_version
// - params_standards
// - params_document_title
// - params_creator
// - params_producer
// - params_preflight_information
// 
// This function uses classes instead of ids because the same value might have to be replaced for 
// multiple elements in the DOM
//
function completeFromParams() {

	// Document name
	$(".params_document_name").html( cals_doc_info.docs[0].file_name );

	// Number of pages
	$(".params_number_of_pages").html( getNumPages() );

	// Trim size summary
	$(".params_summary_trim_size").html( getTrimSizeSummary() );

	// Preflight profile name
	$(".params_profile_name").html( cals_res_info.profile_name );

	// Preflighted when and by
	$(".params_preflighted_when_by").html( cals_env_info.date.slice(0, 10) + "<span class='lighter'> at </span>" +  cals_env_info.date.slice(11, 16) );

	// Summary result
	$(".params_summary_result").html( (getNumberOfErrors() == 0) ? "Success!" : "Errors!" );

	// File size
	$(".params_file_size").html( humanFileSize( cals_doc_info.docs[0].file_size, true ) );

	// PDF version
	$(".params_pdf_version").html( cals_doc_info.docs[0].pdf_version );

	// Standards
	var theStandardsText = ($.isArray( cals_doc_info.docs[0].standards ) && (cals_doc_info.docs[0].standards.length > 0)) ? cals_doc_info.docs[0].standards.join( ", " ) : "none";
	$(".params_standards").html( theStandardsText );

	// Document title
	$(".params_document_title").html( cals_doc_info.docs[0].docinfo.Title );

	// Creator
	$(".params_creator").html( cals_doc_info.docs[0].docinfo.Creator );

	// Producer
	$(".params_producer").html( cals_doc_info.docs[0].docinfo.Producer );

	// Preflight information
	$(".params_preflight_information").html( cals_env_info.tool_name + " " + cals_env_info.tool_variant + " " + cals_env_info.tool_version + "<span class='lighter'> on </span>" + cals_env_info.os_version_text + "<span class='lighter'> by </span>" + cals_env_info.user_name );
}

// Hides either the success or the error image in the report
//
function updateResultImages( inElementSuccess, inElementError ) {

	if (getNumberOfErrors()==0) {
		$(inElementError).hide();
	} else {
		$(inElementSuccess).hide();
	}
}

// Inserts all hits and fixups in the result section of the report
//
function insertHitsAndFixups( inContainer ) {

	// Get the information we need to insert
	var theHits = getHits();
	var theFixups = getFixups();

	// If there is content, create it
	if ((theHits.length > 0) || (theFixups.length > 0)) {

		// Insert all errors, then warnings, then informational items
		for (var theErrorIndex = 0; theErrorIndex < theHits.length; theErrorIndex++) {
			var theError = theHits[theErrorIndex];
			if (theError.severity == "error") {
				insertHit( inContainer, "img/hit_error.pdf", theError.rule_name, theError.matches, theError.on_pages );
			}
		}
		for (var theWarningIndex = 0; theWarningIndex < theHits.length; theWarningIndex++) {
			var theWarning = theHits[theWarningIndex];
			if (theWarning.severity == "warning") {
				insertHit( inContainer, "img/hit_warning.pdf", theWarning.rule_name, theWarning.matches, theWarning.on_pages );
			}
		}
		for (var theInfoIndex = 0; theInfoIndex < theHits.length; theInfoIndex++) {
			var theInfo = theHits[theInfoIndex];
			if (theInfo.severity == "info") {
				insertHit( inContainer, "img/hit_info.pdf", theInfo.rule_name, theInfo.matches, theInfo.on_pages );
			}
		}

		// Insert all fixups
		for (var theFixupIndex = 0; theFixupIndex < theFixups.length; theFixupIndex++) {
			var theFixup = theFixups[theFixupIndex];
			insertFixup( inContainer, "img/hit_fixup.pdf", theFixup.fixup_name, theFixup.succeeded, theFixup.failed );
		}
 
	} else {

		// Nothing to do, hide this section
		$( inContainer ).hide();
	}
}

// Inserts a single hit item in the result section of the report
//
function insertHit( inContainer, inImageURL, inName, inNumberOfTimes, inPageList ) {

	// Insert a container for the hit
	var theHitContainer = $( '<div/>', {
		class: 'section_hits_hit'
	}).appendTo( $(inContainer) );

	// Insert an image and a paragraph
	var theHitImage = $( '<img/>', {
		src: inImageURL
	}).appendTo( theHitContainer );

	// Insert an image and a paragraph
	var theHitText = $( '<p/>').appendTo( theHitContainer );

	// Calculate the text we want for this item and insert it
	var theDescription = inName;
	theHitText.html( theDescription );
}

// Inserts a single fixup item in the result section of the report
//
function insertFixup( inContainer, inImageURL, inName, inSucceeded, inFailed ) {

	// Insert a container for the fixup
	var theFixupContainer = $( '<div/>', {
		class: 'section_hits_fixup'
	}).appendTo( $(inContainer) );
	
	// Insert an image and a paragraph
	var theFixupImage = $( '<img/>', {
		src: inImageURL
	}).appendTo( theFixupContainer );

	// Insert an image and a paragraph
	var theFixupText = $( '<p/>').appendTo( theFixupContainer );

	// Calculate the text we want for this item and insert it
	var theDescription = inName;
	theFixupText.html( theDescription );
}

// Inserts information about colors
//
function insertColorInformation( inContainer ) {

	// Get the color information for the whole document
	var theColorInformation = xmlGetInkCoverageStatistics( 0 );

	// Loop over the colors and divide it in process colors and spot colors
	var theProcessColors = [];
	var theSpotColors = [];
	for (var theIndex = 0; theIndex < theColorInformation.length; theIndex++) {

		// Only handle those that are used
		var theColor = theColorInformation[theIndex];
		if (theColor.percentage > 0) {

			switch( theColor.name ) {

				case "Cyan":
				case "Magenta":
				case "Yellow":
				case "Black": {
					theProcessColors.push( theColor );
					break;
				}
				default: {
					theSpotColors.push( theColor );
					break;
				}
			}
		}
	}

	// Add process information
	for (var theProcessColorIndex = 0; theProcessColorIndex < theProcessColors.length; theProcessColorIndex++) {
		var theColor = theProcessColors[theProcessColorIndex];
		insertColorLine( inContainer, "Process color", theColor.name, theColor.percentage, theColor.squareCm );
	}

	// Add spot color information
	for (var theSpotColorIndex = 0; theSpotColorIndex < theSpotColors.length; theSpotColorIndex++) {
		var theColor = theSpotColors[theSpotColorIndex];
		insertColorLine( inContainer, "Spot color", theColor.name, theColor.percentage, theColor.squareCm );
	}
}

// Inserts one line with color information
//
function insertColorLine( inContainer, inKey, inName, inPercentage, inSurface ) {

	// Insert a container for the color
	var theColorContainer = $( '<div/>', {
		class: 'section_color_key_value'
	}).appendTo( $(inContainer) );

	// Insert two text lines for the color
	var theKeyText = $( '<p/>', {
		class: 'section_color_key'
	}).appendTo( theColorContainer );
	var theValueText = $( '<p/>', {
		class: 'section_color_value'
	}).appendTo( theColorContainer );

	// Set the correct text for them	
	theKeyText.html( inKey );
	theValueText.html( inName + "<span class='lighter smaller'>" + " (" + inPercentage.toFixed(2) + "%, " + inSurface.toFixed(2) + "sqcm" +  ")</span>" );
}



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
