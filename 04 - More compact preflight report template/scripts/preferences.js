//-------------------------------------------------------------------------------------------------
// You can adjust the variables in this file to decide different features in the preflight report
//
// Yes, it's JavaScript so you have to be careful, but trust me, you can do this!
//
//-------------------------------------------------------------------------------------------------
// Author: David van Driessche
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// Showing or hiding different things
//-------------------------------------------------------------------------------------------------
// There is a line of explanation for each of these variable, and you can see what the allowed
// values are.

// Show what has been fixed in the report.
// true: show a line for each fixup that ran
// false: don't show information about fixups
var sShowFixups = true;

// Show informational items, warning or errors
// true: show a line for each informational item, warning or error
// false: don't show information about informational items, warnings or errors
var sShowInfos = true;
var sShowWarnings = true;
var sShowErrors = true;

// Show the "More information" and "Color information" sections
var sShowMoreInformation = true;
var sShowColorInformation = true;


//-------------------------------------------------------------------------------------------------
// Colors
//-------------------------------------------------------------------------------------------------
// You can modify the color of elements by setting it here. Colors can be specified in two ways:
// - "rgb( 255, 255, 255 )", where each value is between 0 and 255
// - "#FFFFFF", where each value is hexadecimal and basically between 00 and FF


// The summary section of the preflight report can be colored with different colors depending on 
// whether errors were found or not.
sColorSummaryBackground_success = "#F0FFF0";
sColorSummaryBackground_error = "#FFF1F0";


// Default colors for reference
// sColorSummaryBackground_success = "#FFFFFF";
// sColorSummaryBackground_error = "#FFFFFF";








