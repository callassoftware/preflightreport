
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
	$(".params_preflighted_when_by").html( cals_env_info.date.slice(0, 10) + " <span class='lighter translatable'>at</span> " +  cals_env_info.date.slice(11, 16) );

	// Summary result
	$(".params_summary_result").html( (getNumberOfErrors() == 0) ? "Success!" : "Errors!" ).addClass("translatable");

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
	$(".params_preflight_information").html( cals_env_info.tool_name + " " + cals_env_info.tool_variant + " " + cals_env_info.tool_version + " <span class='lighter translatable'>on</span> " + cals_env_info.os_version_text + " <span class='lighter translatable'>by</span> " + cals_env_info.user_name );
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

	// Format the occurrence string as we want
	var theOccurrence = addTimes( inNumberOfTimes );
	if ((inPageList != undefined) && (inPageList.length > 0)) {
		theOccurrence += " " + formatPageList( inPageList );
	}

	// Calculate the text we want for this item and insert it
	theHitText.html( inName + "<span class='lighter smaller'>" + " (" + theOccurrence + ")" + "</span>");
}

// Formats a page list for human consumption
//
function formatPageList( inPageList ) {

	// Add one to all pages or they'll be wrong (0-based)
	for (var theIndex = 0; theIndex < inPageList.length; theIndex++) {
		inPageList[theIndex]++;
	}

	// Our page list must at least have one page or we wouldn't get here... let's format easy cases
	// in a special way...
	if (inPageList.length == 1) {
		return "<span class='translatable'>on</span> <span class='translatable'>page</span> " + inPageList[0];
	} else if (inPageList.length < 6) {
		return "<span class='translatable'>on</span> <span class='translatable'>pages</span> " + inPageList.join( ", " );
	} else {
		var theShortList = inPageList.slice( 0, 5);
		var theRemaining = inPageList.length - 5;
		return "<span class='translatable'>on</span> <span class='translatable'>pages</span> " + 
		       theShortList.join( ", " ) + " <span class='translatable'>and</span> " + theRemaining + " <span class='translatable'>more</span>";
	}
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
	var theOccurrence = "";
	var theSucceededString = addTimes( inSucceeded );
	var theFailedString = "<span class='translatable'>failed</span> " + addTimes( inFailed );
	if (inSucceeded == 0) {
		theOccurrence = theFailedString;
	} else {
		theOccurrence = (inFailed == 0) ? theSucceededString : theSucceededString + ", " + theFailedString;
	}
	var theDescription = inName + "<span class='lighter smaller'>" + " (" + theOccurrence + ")</span>";
	theFixupText.html( theDescription );
}

// Adds "time" or "times" to a string depending on the number
//
function addTimes( inNumber ) {

	if (inNumber == 1) {
		return inNumber + " <span class='translatable'>time</span>";
	} else {
		return inNumber + " <span class='translatable'>times</span>";
	}
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
		class: 'section_color_key translatable'
	}).appendTo( theColorContainer );
	var theValueText = $( '<p/>', {
		class: 'section_color_value'
	}).appendTo( theColorContainer );

	// Set the correct text for them	
	theKeyText.html( inKey );
	theValueText.html( inName + "<span class='lighter smaller'>" + " (" + inPercentage.toFixed(2) + "%, " + inSurface.toFixed(2) + "sqcm" +  ")</span>" );
}

