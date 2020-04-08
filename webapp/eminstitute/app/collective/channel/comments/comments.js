initcomments = function()
{
	var app = $("#application");
	var applink = app.data("home") + app.data("applink");

	lQuery('input.commentadder').livequery("keyup",function(e) 
	{
		//Listen for enter
		var input = $(this);
		var div = input.closest(".feedcard-comments");
		var code = e.which; // recommended to use e.which, it's normalized across browsers
	    if(code==13)e.preventDefault();
	    if(code==13)
	    {
	     	//Submit repaint
	     	var options = input.data();
	     	options.oemaxlevel = 1;
	     	options.commenttext = input.val();
	     	var link = applink + "/collective/channel/comments/addcomment.html";
			jQuery.get(link,options,
				function(data) 
				{
					div.replaceWith(data);
				}
	        );	     	
	    } // missing closing if brace 
		
	});
		
}

$(document).ready(function() {

	initcomments();
});
