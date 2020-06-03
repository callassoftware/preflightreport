
//-------------------------------------------------------------------------------------------------
// FILLING IN PREFLIGHT INFORMATION IN THE HTML
//-------------------------------------------------------------------------------------------------

// Looks for the preview image elements and their containers and arranges everything for either a
// one or two page document
//
function updatePreviewImages() {

	// We want one image for the whole file, and one for a particular separation
	var image1 = $( ".preview.page1" );
	var image2 = $( ".preview.page2" );

	// First image is always the normal first page
	image1.attr("src", cals_doc_info.docs[0].pages[0].page_img);

	// For the second page find the separation we want
	if (!("separation" in cals_res_info.vars)) {

		// Nothing found, hide the second image
		$( "td.column2" ).hide();

	} else {
		// The value of the separation
		var separationName = cals_res_info.vars.separation;

		// The array with all images
		var visualizerImages = cals_doc_info.docs[0].pages[0].page_viz_images;
		var target = "cals_viz_sep_" + separationName.toUpperCase() + ".png";
		for (var index = 0; index < visualizerImages.length; index++) {

			var currentImage = visualizerImages[index];
			var nameComponents = currentImage.split("/");
			if (nameComponents[nameComponents.length-1] == target) {
				image2.attr("src", visualizerImages[index]);
				break;
			}
			
		}
	}

	// Calculate the width and height
	var trimSize = xmlGetPageboxDimensions( xmlGetPage( 1 ), xmlEnumPageboxes.trimbox );
	var horizontalArrowText = $( ".dimension.horizontal" );
	var verticalArrowText = $( ".dimension.vertical" );
	horizontalArrowText.text( unitFormatWithUnit( unitConvertFromPoints( trimSize[0], unitUnits.mm ), unitUnits.mm, 1 ));
	verticalArrowText.text( unitFormatWithUnit( unitConvertFromPoints( trimSize[1], unitUnits.mm ), unitUnits.mm, 1 ));
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
				insertHit( inContainer, "&#xe901;", theError.rule_name, theError.matches, theError.on_pages, "error" );
			}
		}
		for (var theWarningIndex = 0; theWarningIndex < theHits.length; theWarningIndex++) {
			var theWarning = theHits[theWarningIndex];
			if (theWarning.severity == "warning") {
				insertHit( inContainer, "&#xe905;", theWarning.rule_name, theWarning.matches, theWarning.on_pages, "warning" );
			}
		}
		for (var theInfoIndex = 0; theInfoIndex < theHits.length; theInfoIndex++) {
			var theInfo = theHits[theInfoIndex];
			if (theInfo.severity == "info") {
				insertHit( inContainer, "&#xe903;", theInfo.rule_name, theInfo.matches, theInfo.on_pages, "info" );
			}
		}

		// Insert all fixups
		for (var theFixupIndex = 0; theFixupIndex < theFixups.length; theFixupIndex++) {
			var theFixup = theFixups[theFixupIndex];
			insertFixup( inContainer, "&#xe902;", theFixup.fixup_name, theFixup.succeeded, theFixup.failed );
		}
 
	} else {

		// Nothing to do, hide this section
		$( inContainer ).hide();
	}
}

// Inserts a single hit item in the result section of the report
//
function insertHit( inContainer, inIconCode, inName, inNumberOfTimes, inPageList, inType ) {

	// Insert a container for the hit
	var theHitContainer = $( '<div/>', {
		class: 'section_hits_hit ' + inType
	}).appendTo( $(inContainer) );

	// Insert an image and a paragraph
	var theHitImage = $( '<p>', {
		class: "icon hit"
	}).html( inIconCode ).appendTo( theHitContainer );

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
function insertFixup( inContainer, inIconCode, inName, inSucceeded, inFailed ) {

	// Insert a container for the fixup
	var theFixupContainer = $( '<div/>', {
		class: 'section_hits_fixup'
	}).appendTo( $(inContainer) );
	
	// Insert an image and a paragraph
	var theFixupImage = $( '<p>', {
		class: "icon fixup"
	}).html( inIconCode ).appendTo( theFixupContainer );

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
		var theColorDefinition = xmlGetInkDefinitionAsText( theColor );
		insertColorLine( inContainer, theColorDefinition, theColor.name, theColor.percentage, theColor.squareCm );
	}

	// Add spot color information
	for (var theSpotColorIndex = 0; theSpotColorIndex < theSpotColors.length; theSpotColorIndex++) {
		var theColor = theSpotColors[theSpotColorIndex];
		var theColorDefinition = xmlGetInkDefinitionAsText( xmlGetInformationForSeparationWithName( theColor.name ) );
		insertColorLine( inContainer, theColorDefinition, theColor.name, theColor.percentage, theColor.squareCm );
	}
}

// Inserts one line with color information
//
function insertColorLine( inContainer, inColorDefinition, inName, inPercentage, inSurface ) {

	// Insert a container for the color
	var theColorContainer = $( '<div/>', {
		class: 'section_color_key_value',
	}).appendTo( $(inContainer) );

	// Insert the color patch and the text
	var theColorPatch = $( '<div/>', {
		class: 'colorpatch',
	}).css('background-color', inColorDefinition).appendTo( theColorContainer );
	var theValueText = $( '<p/>', {
		class: 'section_color_value'
	}).appendTo( theColorContainer );

	// Set the correct text for them	
	theValueText.html( inName + "<span class='lighter smaller'>" + " (" + inPercentage.toFixed(2) + "%, " + inSurface.toFixed(2) + "sqcm" +  ")</span>" );
}

// Updates the ink coverage image in the report
//
function updateInkCoverageImage() {

	// We support only one page so we'll always take page 1
	var imageInkCoverage = $( ".ink_coverage_preview img" );
	imageInkCoverage.attr("src", cals_doc_info.docs[0].pages[0].page_viz_images[0]);
}

// Inserts images to show all separations for the first page
//
function insertSeparationImages() {

	// The container we want to insert them into
	var separationContainer = $( ".separation_preview" );

	// Loop over all images and insert them
	for (var index = 1; index < cals_doc_info.docs[0].pages[0].page_viz_images.length; index++) {

		// Separation image
		var imagePath = cals_doc_info.docs[0].pages[0].page_viz_images[index];
		var sepName = imagePath.split("_").pop().split(".").shift();

		// Create an image, attach it and set its source to what we want
		var imageContainer = $( '<div>', {
			class: "separation_preview_single"
		} ).appendTo( separationContainer );
		var title = $( '<p>' ).appendTo( imageContainer );
		title.text( sepName );
		var image = $( '<img/>', {
			src: imagePath
		} ).appendTo( imageContainer );
	}
}


//-------------------------------------------------------------------------------------------------
// PREFERENCES SUPPORT
//-------------------------------------------------------------------------------------------------


// Called when all resources for the page are ready and loaded
//
$( window ).on( "load", function() {

	// Visibility control
	$( ".section_hits_fixup" ).toggle( sShowFixups );
	$( ".section_hits_hit.info" ).toggle( sShowInfos );
	$( ".section_hits_hit.warning" ).toggle( sShowWarnings );
	$( ".section_hits_hit.error" ).toggle( sShowErrors );
	$( "#section_more_information" ).toggle( sShowMoreInformation );
	$( "#section_colors" ).toggle( sShowColorInformation );
	$( "#page_ink_coverage" ).toggle( sShowInkCoverage );
	$( "#page_separations" ).toggle( sShowSeparations );
	$( ".hide_elements" ).toggle( sShowElements );

	// Color support	
	var accentColor = (getNumberOfErrors() == 0) ? sColorSuccess : sColorError;
	$( ".header" ).css( "background-color", accentColor );
	$( ".params_document_name" ).css( "color", accentColor );
	$( ".section_with_title p.title span" ).css( "color", accentColor );
	$( ".section_with_title p.title" ).css( "border-bottom-color", accentColor );
	$( ".section_more_information_key:before" ).css( "color", accentColor );
	$( ".icon.hit, .icon.fixup, .bullet" ).css( "color", accentColor );
});


