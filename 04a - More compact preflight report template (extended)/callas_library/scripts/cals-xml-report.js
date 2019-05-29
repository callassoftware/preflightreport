 //-------------------------------------------------------------------------------------------------
// Support functions for callas template reports
//
//-------------------------------------------------------------------------------------------------
// Copyright © 2015 - Four Pees
// Author: David van Driessche
//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// REPORT MANAGEMENT
//-------------------------------------------------------------------------------------------------

// Provide a global variable to keep track of our XML report
var sXmlRoot = null;

// Gets the (potentially cached) root of the XML report. To access the XML report you MUST use this 
// function to get its root. You can call this function frequently as it caches loading the report.
//
function xmlGetRootElement() {
	
	if (sXmlRoot === null) {
		//var theXmlHttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		var theXmlHttp = new XMLHttpRequest();
		theXmlHttp.open("GET", cals_res_info.xml_report, false);
		theXmlHttp.send();
		sXmlRoot = theXmlHttp.responseXML;
	}
	return sXmlRoot;
}

// This debug function returns true of the XML report has previously been loaded. Calling this function after
// getXmlRootElement _should_ return true; if not, check whether your template has asked for XML report generation.
//
function xmlIsReportAvailable() {

	return (sXmlRoot === null) ? false : true; 
}

// This function should be passed to XPath queries into the report. It resolves the default report namespace (pi4)
// into a full URL that will work in the report
//
function xmlNamespaceResolver( inPrefix ) {
	
	if( inPrefix === "pi4")
		return "http://www.callassoftware.com/namespace/pi4";
	else
		throw "Unknown prefix: " + inPrefix;
}



//-------------------------------------------------------------------------------------------------
// WORKING WITH PAGES
//-------------------------------------------------------------------------------------------------

// Get the number of pages in the document
//
function xmlGetNumPages() {

	// Run a "count" XPath instruction on the XML document. Because of how we build the XPath request, 
	// the result should be a single number
	var theXmlRoot = xmlGetRootElement();
	var theResult = theXmlRoot.evaluate( "count(/pi4:report/pi4:document/pi4:pages/pi4:page)", theXmlRoot, 
										 xmlNamespaceResolver, XPathResult.NUMBER_TYPE, null );

	// Check whether we got something and whether that something is actually a number, then return it
	return ((theResult === null) || (theResult.resultType !== XPathResult.NUMBER_TYPE)) ? 0 : theResult.numberValue;
}

// Get the pages in the document - returns one XML element node per page
//
function xmlGetPages() {

	// Run an XPath call to get the correct element nodes for all pages in the right order
	var theXmlRoot = xmlGetRootElement();
	var theNodes = theXmlRoot.evaluate( "/pi4:report/pi4:document/pi4:pages/pi4:page", theXmlRoot, 
					  				    xmlNamespaceResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

	// Create a result array and fill it
	var theResult = [];
	var thePage = theNodes.iterateNext();
	while (thePage) {
		theResult.push( thePage );
		thePage = theNodes.iterateNext();
	}

	// Return our result
	return theResult;
}

// Get a specific page in the document. If you need all pages, it's going to be faster to use xmlGetPages
// instead. The parameter "inPageNumber" is human (i.e. the first page is number 1).
//
function xmlGetPage( inPageNumber ) {

	// Run an XPath call to get the correct element node for our page
	var theXmlRoot = xmlGetRootElement();
	var theNode = theXmlRoot.evaluate( "/pi4:report/pi4:document/pi4:pages/pi4:page[@id='PAG" + inPageNumber + "']", theXmlRoot, 
				   					   xmlNamespaceResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
	return theNode;
}



//-------------------------------------------------------------------------------------------------
// WORKING WITH PAGE BOXES
//-------------------------------------------------------------------------------------------------

// An enum to represent the different page boxes
var xmlEnumPageboxes = {

	mediabox: 	{ value: 1, name: "mediabox" },
	cropbox:    { value: 2, name: "cropbox" }, 
	trimbox: 	{ value: 3, name: "trimbox" },
	bleedbox: 	{ value: 4, name: "bleedbox" },
	artbox: 	{ value: 5, name: "artbox" }
};
Object.freeze(xmlEnumPageboxes);

// Returns true if there is an explicit pagebox for a given page
// IN: an XML node for the page
// IN: an enum identifying the pagebox
// OUT: true if the pagebox is explicitly defined for the page, false if not
function xmlHasPagebox( inPage, inPagebox ) {

	return (inPage.hasAttribute( inPagebox.name )) ? true : false;
}

// Get the specified pagebox for a given page
// IN: an XML node for the page
// IN: an enum identifying the pagebox
// OUT: an array with 4 elements (LLX, LLY, URX, URY)
//
function xmlGetPagebox( inPage, inPagebox ) {

	// Explicit presence, get the attribute and return it as an array
	if (xmlHasPagebox( inPage, inPagebox )) {
		return inPage.getAttribute( inPagebox.name ).split( "/" );
	}

	// No explicit presence, if we have a fallback, return that
	if (inPagebox === xmlEnumPageboxes.cropbox) {
		return xmlGetPagebox( inPage, xmlEnumPageboxes.mediabox );
	}
	if (inPagebox === xmlEnumPageboxes.trimbox) {
		return xmlGetPagebox( inPage, xmlEnumPageboxes.cropbox );
	}
	if (inPagebox === xmlEnumPageboxes.bleedbox) {
		return xmlGetPagebox( inPage, xmlEnumPageboxes.cropbox );
	}
	if (inPagebox === xmlEnumPageboxes.artbox) {
		return xmlGetPagebox( inPage, xmlEnumPageboxes.cropbox );
	}

	// No explicit and no fallback, return an array with 0s
	return Array.apply(null, new Array(4)).map(Number.prototype.valueOf,0); 
}

// Get the width and height of the mediabox for a given page.
// IN: an XML node for the page
// IN: an enum identifying the pagebox
// OUT: An array with two elements (width, height)
//
function xmlGetPageboxDimensions( inPage, inPagebox ) {

	var theResult = [];
	var thePagebox = xmlGetPagebox( inPage, inPagebox );
	theResult[0] = thePagebox[2] - thePagebox[0];		// Upper right X - lower left X
	theResult[1] = thePagebox[3] - thePagebox[1];		// Upper right Y - lower left Y
	return theResult;
}


// Get the width and height of the page box for all pages in the document
// IN: an XML node for the page
// IN: an enum identifying the pagebox
// OUT: An array with objects containing "width" and "height" for all pages
//
function xmlGetPageboxDimensionsForAllPages( inPagebox ) {

	// Get an array with XML objects for each page
	var thePageXMLs = xmlGetPages();

	var theResult = [];
	for (var thePageIndex = 0; thePageIndex < thePageXMLs.length; thePageIndex++) {

		var theDimensionsArray = xmlGetPageboxDimensions( thePageXMLs[thePageIndex], inPagebox );
		var theResultForPage = { width: theDimensionsArray[0], height: theDimensionsArray[1] };
		theResult.push( theResultForPage );
	}

	return theResult;
}



//-------------------------------------------------------------------------------------------------
// WORKING WITH INK COVERAGE STATISTICS
//-------------------------------------------------------------------------------------------------
// This section assumes you have requested accurate ink coverage statistics and this information
// is present in the XML report

// Get the resolution on which the ink coverage has been calculated
// OUT: a number representing the ink coverage
function xmlGetInkCoverageResolution() {

	// Run an XPath call to get the correct element node the document ink coverage statistics
	var theXmlRoot = xmlGetRootElement();
	var thePlatenamesNode = theXmlRoot.evaluate( "/pi4:report/pi4:document/pi4:doc_info/pi4:platenames", theXmlRoot, 
					  				    		 xmlNamespaceResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;

	// Now check whether it has the correct attribute and if so return its value as a number
	return (thePlatenamesNode.hasAttribute( "inkcov_resolution_ppi" )) ?
				Number(thePlatenamesNode.getAttribute( "inkcov_resolution_ppi" )) :
				null;
}

// Get the list of plates and their ink coverage statistics
// IN: The (human = 1-based) page number for the page or 0 if you want the statistics for the whole document
// OUT: An array of objects containing specifics for each plate
function xmlGetInkCoverageStatistics( inPageNumber ) {

	// Different XPath depending on whether we want the document statistics or one for a page
	var theXPath = (inPageNumber === 0) ? 
						"/pi4:report/pi4:document/pi4:doc_info/pi4:platenames/pi4:platename" :
						"/pi4:report/pi4:document/pi4:pages/pi4:page[@id='PAG" + inPageNumber + "']/pi4:platenames/pi4:platename";

	// Run an XPath call to get the correct element node the document ink coverage statistics
	var theXmlRoot = xmlGetRootElement();
	var thePlatenameNodes = theXmlRoot.evaluate( theXPath, theXmlRoot, xmlNamespaceResolver, 
												 XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

	// The result is always an array
	var theResult = [];

	// Iterate over the results and push each node on an array
	var thePlateNameNode = thePlatenameNodes.iterateNext();
	while (thePlateNameNode !== null) {

		// Create a set with appropriate properties for all platename information
		var thePlateInfo = {};
		thePlateInfo.name = thePlateNameNode.childNodes[0].nodeValue;
		thePlateInfo.percentage = Number( thePlateNameNode.getAttribute( "inkcov_prct" ) );
		thePlateInfo.squareCm = Number( thePlateNameNode.getAttribute( "inkcov_cm2" ) );
		thePlateInfo.squareInch = Number( thePlateNameNode.getAttribute( "inkcov_inch2" ) );
		theResult.push( thePlateInfo );
		thePlateNameNode = thePlatenameNodes.iterateNext();
	}
	
	// Return what we found
	return theResult;
}



//-------------------------------------------------------------------------------------------------
// WORKING WITH RESOURCES - COLORSPACES
//-------------------------------------------------------------------------------------------------

// A generic function to get the nodes for all colorspaces used in a document
// OUT: an array with "colorspace" nodes as found in the resources section of the XML report
function xmlGetColorspaces() {

	// Run an XPath call to get the correct element node for the colorspaces
	var theXmlRoot = xmlGetRootElement();
	var theColorspaceNodes = theXmlRoot.evaluate( "/pi4:report/pi4:document/pi4:resources/pi4:colorspaces/pi4:colorspace", theXmlRoot, xmlNamespaceResolver, 
												 XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

	// The result is always an array
	var theResult = [];

	// Iterate over the results and push each node on an array
	var theColorspaceNode = theColorspaceNodes.iterateNext();
	while (theColorspaceNode !== null) {

		theResult.push( theColorspaceNode );
		theColorspaceNode = theColorspaceNodes.iterateNext();
	}

	// Return what we found
	return theResult;
}

// A utility function to get all information specifically for separation color spaces
// OUT: An array of objects containing specifics for each colorspace
function xmlGetSeparationColorSpaceInformation() {

	// Run an XPath call to get the correct element node for the colorspaces that are of type "separation"
	var theXmlRoot = xmlGetRootElement();
	var theColorspaceNodes = theXmlRoot.evaluate( "/pi4:report/pi4:document/pi4:resources/pi4:colorspaces/pi4:colorspace[@type='Separation']", 
												  theXmlRoot, xmlNamespaceResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

	// The result is always an array
	var theResult = [];

	// Iterate over the results and push each node on an array
	var theColorspaceNode = theColorspaceNodes.iterateNext();
	while (theColorspaceNode !== null) {

		// Create a set with appropriate properties for all platename information
		var theSeparationInfo = {};

		// Get the ID (an attribute)
		theSeparationInfo.id = theColorspaceNode.getAttribute( "id" );

		// Get the name of the separation space
		theSeparationInfo.name = theColorspaceNode.getElementsByTagName( "name" )[0].childNodes[0].nodeValue;

		// Get the information for the alternate color space
		var theAlternateColorSpaceNode = theColorspaceNode.getElementsByTagName( "alternate_colorspace" )[0];
		theSeparationInfo.alternateId = theAlternateColorSpaceNode.getAttribute( "id" );
		theSeparationInfo.alternateName = theAlternateColorSpaceNode.childNodes[0].nodeValue;

		// Get the information for the alternate color space values
		var theAlternatesNode = theColorspaceNode.getElementsByTagName( "alternate_values" )[0];
		var theAlternateValueNodes = theAlternatesNode.getElementsByTagName( "li" );

		// Store these
		theSeparationInfo.alternateValues = [];
		for (var theAlternateIndex = 0; theAlternateIndex < theAlternateValueNodes.length; theAlternateIndex++ ) {
			theSeparationInfo.alternateValues.push( theAlternateValueNodes[theAlternateIndex].childNodes[0].nodeValue );
		}

		// Store and go to next
		theResult.push( theSeparationInfo );
		theColorspaceNode = theColorspaceNodes.iterateNext();
	}
	
	// Return what we found
	return theResult;
}

// Utility function to get the separation space information for a specific separation color space
// IN: The name of the separation color space
// OUT: The object containing specifics for that colorspace or null if it's not found
function xmlGetInformationForSeparationWithName( inName ) {

	// Start by getting the list with separation color spaces
	var theSeparationColorspaces = xmlGetSeparationColorSpaceInformation();

	// Now loop over the array and return the value as soon as we find it
	for( var theIndex = 0; theIndex < theSeparationColorspaces.length; theIndex++ ) {
		var theSpace = theSeparationColorspaces[theIndex];
		if (theSpace.name === inName) return theSpace;
	}

	// Nothing found
	return null;
}

 //-------------------------------------------------------------------------------------------------
 // GETTING NOHITS
 //-------------------------------------------------------------------------------------------------

 // Get all Nohits
 function xmlGetNohits() {
	 const sXmlRoot = xmlGetRootElement();
	 const xpath = "/pi4:report/pi4:results/pi4:nohits";
	 const it = sXmlRoot.evaluate(xpath, sXmlRoot, xmlNamespaceResolver, XPathResult.ANY_TYPE, null);
	 var nohit = it.iterateNext();
	 var i = -1;
	 var nohits = [];
	 while (nohit !== null) {
		 i++;
		 nohits[i] = nohit;
		 nohit = it.iterateNext();
	 }
	 nohits.pop();
	 return nohits;
 }

 // Get the rule id for all nohits
 function xmlGetRuleIds( nohits ) {
	 var ids = [];
	 nohits.forEach(function (value) {
		 ids.push(value.getAttribute('rule_id'));
	 });
	 return ids;
 }

 // Get the rule for a given id
 function xmlGetRuleNomatchById( id ) {
	 const xpath = '/pi4:report/pi4:profile_info/pi4:rules/pi4:rule[@id="' + id + '"]/pi4:display_nomatch';
	 const rule_nomatch = sXmlRoot.evaluate( xpath, sXmlRoot, xmlNamespaceResolver, XPathResult.ANY_TYPE, null);
	 return rule_nomatch.iterateNext();

 }

 // Get the texts for all Nomatches
 function xmlGetNomatchTexts() {
	 const ids = xmlGetRuleIds(xmlGetNohits());
	 var texts = [];
	 ids.forEach(function (value) {
		 texts.push(xmlGetRuleNomatchById(value).childNodes[0].nodeValue);
	 });
	 return texts;
 }

 function removeElement( elementId ) {
	 var element = document.getElementById(elementId);
	 element.parentNode.removeChild(element);
 }

 function makeUL(array) {
	 // Create the list element:
	 const list = document.createElement('ul');

	 for (var i = 0; i < array.length; i++) {
		 // Create the list item:
		 const item = document.createElement('li');

		 // Set its contents:
		 item.appendChild(document.createTextNode(array[i]));

		 // Add it to the list:
		 list.appendChild(item);
	 }

	 // Finally, return the constructed list:
	 return list;
 }

 function createNomatchItems() {
	 if (xmlGetNohits().length === 0 || sShowNoHits === false) {
		 removeElement("nohits");
	 } else {
		 var items = xmlGetNomatchTexts();
		 document.getElementById('nohits').appendChild(makeUL(items));
	 }
 }

 //-------------------------------------------------------------------------------------------------
 // GETTING PAGE GEOMETRY BOXES
 //-------------------------------------------------------------------------------------------------

 function xmlGetTrimBoxWidthForPage( pageNumber )
 {
	 // Get the page and return the width of its TrimBox
	 var thePage = xmlGetPage( pageNumber );
	 if (thePage.getAttribute('trimbox') !== null) {
		 return thePage.getAttribute('trimbox').split("/")[2] - thePage.getAttribute('trimbox').split("/")[0];
	 } else return null
 }

 function xmlGetTrimBoxHeightForPage( pageNumber )
 {
	 // Get the page and return the height of its TrimBox
	 var thePage = xmlGetPage( pageNumber );
	 if (thePage.getAttribute('trimbox') !== null) {
		 return thePage.getAttribute('trimbox').split("/")[3] - thePage.getAttribute('trimbox').split("/")[1];
	 } else return null
 }

 function xmlGetCropBoxWidthForPage( pageNumber )
 {
	 // Get the page and return the width of its CropBox
	 var thePage = xmlGetPage( pageNumber );
	 if (thePage.getAttribute('cropbox') !== null) {
		 return thePage.getAttribute('cropbox').split("/")[2] - thePage.getAttribute('cropbox').split("/")[0];
	 } else return null
 }

 function xmlGetCropBoxHeightForPage( pageNumber )
 {
	 // Get the page and return the height of its CropBox
	 var thePage = xmlGetPage( pageNumber );
	 if (thePage.getAttribute('cropbox') !== null) {
		 return thePage.getAttribute('cropbox').split("/")[3] - thePage.getAttribute('cropbox').split("/")[1];
	 } else return null
 }

 //-------------------------------------------------------------------------------------------------
 // GETTING FONT AND OUTPUT INTENT
 //-------------------------------------------------------------------------------------------------


 function xmlGetFontName( xmlDoc, fontID )
 {
	 var xpath = "/pi4:report/pi4:document/pi4:resources/pi4:fonts/pi4:font[@id='" + fontID+ "']/pi4:name";

	 // choice 1: use iterator
	 var it = xmlDoc.evaluate( xpath, xmlDoc, xmlNamespaceResolver, XPathResult.ANY_TYPE, null);
	 var nodes1 = [];
	 var node;
	 while (node = it.iterateNext())
	 {
		 nodes1.push(node);
	 }

	 if( nodes1.length == 1 )
		 return nodes1[0];
	 else
		 throw "Font not found: " + ruleID;
 }

 function xmlGetOutputIntentName( xmlDoc, oiID )
 {
	 var xpath = "/pi4:report/pi4:document/pi4:resources/pi4:output_intents/pi4:output_intent[@id='" + oiID+ "']/pi4:output_profilename";

	 // choice 1: use iterator
	 var it = xmlDoc.evaluate( xpath, xmlDoc, xmlNamespaceResolver, XPathResult.ANY_TYPE, null);
	 var nodes1 = [];
	 var node;
	 while (node = it.iterateNext())
	 {
		 nodes1.push(node);
	 }

	 if( nodes1.length == 1 )
		 return nodes1[0];
	 else
		 throw "OutputIntent not found: " + ruleID;
 }

 function xmlWriteFonts( xmlDoc, parent )
 {
	 if( null != parent )
	 {
		 var font_list = xmlDoc.getElementsByTagName("font");
		 for (f=0;f<font_list.length;f++)
		 {
			 try
			 {
				 var font = font_list[f];
				 if( font.hasAttribute("id") && font.hasAttribute("embedded") && font.getAttribute("embedded") === "0" )
				 {
					 var fontID = font.getAttribute("id");
					 var fname = xmlGetFontName( xmlDoc, fontID );
					 var div = document.createElement("div");
					 div.innerHTML = "<li>" + fname.childNodes[0].nodeValue + "</li>";
					 parent.appendChild(div);
				 }
			 }
			 catch(x)
			 {
				 alert(x);
			 }
		 }
	 }
 }

 function xmlWriteOutputIntent( xmlDoc, parent )
 {
	 if( null != parent )
	 {
		 var oi_list = xmlDoc.getElementsByTagName("output_intent");
		 for (o=0;o<oi_list.length;o++)
		 {
			 try
			 {
				 var oi = oi_list[o];
				 if( oi.hasAttribute("id") )
				 {
					 var oiID = oi.getAttribute("id");
					 var oiType = oi.getAttribute("subtype");

					 switch (oiType) {
						 case "GTS_PDFX": oiType = "PDF/X"; break;
						 case "GTS_PDFA1": oiType = "PDF/A"; break;
						 case "ISO_PDFE1": oiType = "PDF/E"; break;
					 }

					 var oName = xmlGetOutputIntentName( xmlDoc, oiID );
					 var div = document.createElement("div");
					 div.innerHTML = oName.childNodes[0].nodeValue + " (" + oiType + ")";
					 parent.appendChild(div);
				 }
			 }
			 catch(x)
			 {
				 alert(x);
			 }
		 }
	 }
 }

 function xmlAddResults()
 {
	 try
	 {
		 xmlWriteFonts(sXmlRoot,document.getElementById("xmlFonts"));
		 xmlWriteOutputIntent(sXmlRoot,document.getElementById("oi_name"));

	 }
	 catch(x)
	 {
		 document.getElementById("xmlFonts").innerHTML=x;
		 document.getElementById("oi_name").innerHTML=x;
	 }
	 if (document.getElementById("oi_name").innerHTML === '') {
	 	$('.oi').toggle(false);
	 }
 }
