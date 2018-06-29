jQuery(document).ready(function() 
{ 

$(".uploaddescription").livequery("focusin",function()
{
	$(".showonfocus").show();
	//$(".uploaddescription").attr("placeholder","Start typing");

});

$("#autofinishbutton").livequery("click",function(e)
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


$(".sidebartogglebtn").livequery("click",function(e)
{
	e.stopPropagation()
	$(this).toggle();
	$("#oisidebar").toggleClass('sidebaractive');
});
$(".sidebartogglebtnout").livequery("click",function(e)
		{
			e.stopPropagation()
			$("#oisidebar").toggleClass('sidebaractive');
			$(".sidebartogglebtn").toggle();
		});

});