jQuery(document).ready(function() 
{ 

lQuery(".attachfile").livequery("click",function()
{
	$(".showonfocus").toggle();
	//$(".uploaddescription").attr("placeholder","Start typing");

});

lQuery(".uploaddescription").livequery("keyup",function(e)
{
	//submit
	var targetdiv = $(this).data("targetdiv");
	if( e.keyCode == "13" )
	{
		var form = jQuery("#uploaddata");
		form.ajaxSubmit({
			error: function(data ) {
				alert("error");
				$("#" + targetdiv).html(data);
				//$("#" + targetdiv).replaceWith(data);
			},
			success : function(result, status, xhr, $form) {
	        	$("#" + targetdiv).replaceWith(result);
	    	},
			data: { oemaxlevel: 1 }
		 });
	} 
});

lQuery("#autofinishbutton").livequery("click",function(e)
{
	e.preventDefault(); 
	var button = $(this);
	var href = button.attr('href');
	var args = button.data();
	args["collectionid"] = $("#currentcollection").val(); 
	args["sourcepath"] = $("#customsourcepath").val(); 
	args["uploaddescription"] = $("#uploaddescription").val(); 
	
	console.log(href,args);
	jQuery.get(href,args, function(response) 
	{
		var okpage = button.data("okpage");	
		window.location.href = okpage;
	});
});


lQuery(".sidebartogglebtn").livequery("click",function(e)
{
	e.stopPropagation()
	$(this).toggle();
	$("#oisidebar").toggleClass('sidebaractive');
});
lQuery(".sidebartogglebtnout").livequery("click",function(e)
		{
			e.stopPropagation()
			$("#oisidebar").toggleClass('sidebaractive');
			$(".sidebartogglebtn").toggle();
		});

});

