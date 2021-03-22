$(document).ready(function()
{

//	getFinderOverlay = function()
//	{
//		var hidden = $("#hiddenoverlay");
//		if( hidden.length == 0 )
//		{
//		}
	
	lQuery('#hiddenoverlay').livequery(function(){
		var modal = $(this);///.find("#emmodalinner");
  		var visibleHeight = $(window).height();
  		var visibleWidth = $(window).width();

		modal.css("height", visibleHeight + "px");
		modal.css("width", visibleWidth + "px");
		
		modal.show();
		gridResize();
		
		
	})
	
});

