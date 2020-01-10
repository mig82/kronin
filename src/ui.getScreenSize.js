/**
 * A function which maps the width of a screen in pixels to a t-shirt size for the
 * screen. The idea behind this is that if the breakpoints for a form change -e.g.:
 * if the developer decides to move a breakpoint from 320px to 340px- this avoids
 * the need to change any if/elseif or switch statements written to handle each
 * particular breakpoint.
 * Note this assumes that the breakpoints in the form are defined in ascending order
 * from the smallest to the largest one.
 *
 * @author Miguelangel Fernandez <miguel@kony.com>
 *
 * @param  Array breakpoints The breakpoints configured for a form. From FlexForm.breakpoints -e.g.: [320,640,1024,1200].
 * @param  Number width       The screen's width in pixels. From FlexForm.onBreakpointChange(form, width) -e.g. 1024.
 * @return String             A t-shirt size for the screen.
 */
var getScreenSize = function(breakpoints, width){
	var index = breakpoints.indexOf(width);
	var size;
	switch(index){
		case 0:
			size = "XS";
			break;
		case 1:
			size = "S";
			break;
		case 2:
			size = "M";
			break;
		case 3:
			size = "L";
			break;
		case 4:
			size = "XL";
			break;
		case 5:
			size = "XXL";
			break;
		default:
			throw new Error("Unknown screen resolution");
	}
	kony.print(`Screen size: ${size}`);
	return size;
};
