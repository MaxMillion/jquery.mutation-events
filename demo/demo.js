jQuery(function($) {

	// This is a demonstration of custom Mutation Events triggered by attribute
	// changes using jQuery.attr/jQuery.fn.attr functions.
	// I'm using ARIA roles & attributes for convenience, please note it is NOT
	// meant to be a demonstration of ARIA - it could just as easily use custom
	// attributes or even jQuery.data instead.

	// Convert an IDREFS string into a jQuery set
	function idrefs( str ) {
		str = $.trim(str);
		return $( str ? '#' + (str.split(/\s+/).join(',#')) : "" );
	}
	
	// Convert a jQuery set into an IDREFS string
	function ids( jq ) {
		return Array.prototype.join.call(jq.map(function() { return this.id; }), ' ');
	}
	
	// Log attr mutation events in the console (if available)
	if ( window.console && window.console.log ) {
		$(document).bind('attr', function(event) {
			var notice = event.isDefaultPrevented() ? 'DefaultPrevented ' : '';
			console.log('%s%s %s: %s -> %s %o', notice, event.type, event.attrName, event.prevValue, event.newValue, event.target);
		});
	}
	
	$('[role~=tablist]')
		// Listen for attribute changes
		.bind('attr', function(event) {
			if ( this === event.target && event.attrName === 'aria-activedescendant' ) {
				var sel = idrefs( event.newValue ).not('[aria-disabled=true]');
				if ( sel.length > 0 ) {
					// Deselect previously selected tab
					idrefs( event.prevValue ).attr('tabindex', -1);
					// Select new tab
					sel.attr('tabindex', 0);
					// Fix the value
					event.newValue = ids( sel );
				} else {
					// A valid/enabled tab id was not given
					event.preventDefault();
				}
			}
		});

	$('[role~=tab]')
		// Ensure all tabs can be click focused
		.attr('tabindex', -1)
		
		.bind('attr', function(event) {
			if ( this === event.target && event.attrName === 'tabindex' ) {
				idrefs( $.attr(this, 'aria-controls') ).attr( 'aria-hidden', !!parseInt(event.newValue) );
			}
		})
		
		.bind('focus', function(event) {
			$(this).parent('[role~=tablist]').attr('aria-activedescendant', this.id);
		})
		
		.bind('keydown', function(event) {
			switch (event.keyCode) {
				case 37: $(this).prev('[role~=tab]').focus(); return false; // LEFT
				case 39: $(this).next('[role~=tab]').focus(); return false; // RIGHT
				case 36: $(this).siblings('[role~=tab]:first').focus(); return false; // HOME
				case 35: $(this).siblings('[role~=tab]:last').focus(); return false; // END
			}
		});

	$('[role~=tabpanel]').attr('tabindex', 0);

	$('[role~=tab]:first').focus();
});
