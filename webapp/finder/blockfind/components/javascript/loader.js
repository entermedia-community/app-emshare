$(document).ready(function()
{

//	getFinderOverlay = function()
//	{
//		var hidden = $("#hiddenoverlay");
//		if( hidden.length == 0 )
//		{
//		}
	
	//Check to see if there is finder loaded already
	
	
	
	lQuery('#emmodal').livequery(function(){
		var modal = $(this).closest("#emmodalinner");
  		var visibleHeight = $(window).height();
  		var visibleWidth = $(window).width();

		modal.css("height", visibleHeight + "px");
		modal.css("width", visibleWidth + "px");
		
	})
	
});

