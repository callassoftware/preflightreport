//-------------------------------------------------------------------------------------------------
// Support functions for customizing template reports
//
//-------------------------------------------------------------------------------------------------
// Copyright © 2015 - Four Pees
// Author: David van Driessche
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// VARIABLES - ADJUST THIS SECTION TO MODIFY THE REPORT
//-------------------------------------------------------------------------------------------------

// Show the information box (with preview icon etc.) at the top of the report
var sShowInfoBox = true;

// Show the section with details (contains hits, document info, environment...)
var sShowDetails = true;								 

// Show the section with hits (WARNING: disabling this will hide errors!)
var sShowDetailsHits = true;

// Show the section with document information
var sShowDetailsDocumentInfo = true;

// Show the section with environment information
var sShowDetailsEnvironment = true;

// Show errors in the report (WARNING: disabling this will hide errors and might create reports
// that look like success reports even though the preflight generated errors)
var sShowDetailsHits_Errors = true;

// Show warnings in the report. Disabling this will remove the list of warnings and the warning
// icon in the info box at the top of the report
var sShowDetailsHits_Warnings = true;

// Show informations in the report. Disabling this will remove the list of information items and
// the information icon in the info box a the top of the report
var sShowDetailsHits_Infos = true;

// Show fixups in the report. Disabling this will remove the list of fixups from the report
var sShowDetailsHits_Fixups = true;

// Show a grayed out version of the error, warning or info icon in the info box if there are no
// equivalent items. Setting this to false will hide the icon alltogether.
var sShowOverviewIconIfNoHitsOfThatType = false;

// The standard callas report uses three different colors. A dark red as primary accent color, a
// dark grey as secondary accent color and a lighter gray for the background behind the preview.
// You can find the original color values below and can modify them as needed.
/*
var sColorThumbnailBackground = "rgb(200,200,200)";
var sColorAccent = "rgb(154,21,69)";
var sColorSecondaryAccent = "rgb(105,105,105)";
*/

var sColorThumbnailBackground = "#F7CCFF";
var sColorAccent = "#48016D";
var sColorSecondaryAccent = "rgb(105,105,105)";


//-------------------------------------------------------------------------------------------------
// END VARIABLES - DON'T ADJUST BEYOND HERE UNLESS YOU KNOW WHAT YOU'RE DOING
//-------------------------------------------------------------------------------------------------





//-------------------------------------------------------------------------------------------------
// VISIBILITY
//-------------------------------------------------------------------------------------------------

// Set an element with a given ID to visible (true) or invisible (false)
// IN: inId, the ID of the element to change
// IN: inVisible, true if the element should be visible, false if not
//
function reportSetVisibilityForElementWithId( inId, inVisible ) {

	$( "#" + inId ).toggle( inVisible );
}

// Set an element with a given class to visible (true) or invisible (false)
// IN: inClass, the class of the element to change
// IN: inVisible, true if the element should be visible, false if not
//
function reportSetVisibilityForElementWithClass( inClass, inVisible ) {

	$( "." + inClass ).toggle( inVisible );
}



//-------------------------------------------------------------------------------------------------
// PERFORMING CUSTOMIZATIONS REQUESTED
//-------------------------------------------------------------------------------------------------

// Called when all resources for the page are ready and loaded
//
$( window ).load(function() {

	// Ajust visibility of elements
	reportSetVisibilityForElementWithId( "infobox", sShowInfoBox );
	reportSetVisibilityForElementWithId( "details", sShowDetails );
	reportSetVisibilityForElementWithId( "details_hits", sShowDetailsHits );
	reportSetVisibilityForElementWithId( "details_docinfo", sShowDetailsDocumentInfo );
	reportSetVisibilityForElementWithId( "details_environment", sShowDetailsEnvironment );

	// Visibility settings for errors, warnings, infos and fixes are controlled in the actual
	// Javascript code that adds these items to the report

	// Change colors as necessary
	$( "span.red" ).css( "color", sColorAccent );
	$( "div.hrule" ).css( "background-color", sColorAccent );
	$( "#tool_name" ).css( "color", sColorAccent );
	$( "#tool_variant" ).css( "color", sColorSecondaryAccent );
	$( "span.severity_label" ).css( "color", sColorSecondaryAccent );
	$( "span.fixup_label" ).css( "color", sColorAccent );
	$( "span.docinfo_label" ).css( "color", sColorAccent );
	$( "span.environment_label" ).css( "color", sColorAccent );
	$( "div.ov_hit_box" ).css( "border-color", sColorAccent );
	$( "#infobox" ).css( "border-color", sColorAccent );
	$( "#header" ).css( "border-color", sColorAccent );
	$( "#overview_preview" ).css( "background-color", sColorThumbnailBackground );
	$( ".step_header" ).css( "border-color", sColorAccent );
});
















