jQuery(document).ready(function(url,params) 
{ 
	var apphome = $('#application').data('home') + $('#application').data('apphome');
	
	$('.taskcard').hover(
  function () {
    $(this).find(".dragicon").show();
  }, 
  function () {
    $(this).find(".dragicon").hide();
  }
);
	
	if( jQuery.fn.draggable )
	{
		jQuery(".ui-draggable").livequery( 
			function()
			{	
				jQuery(this).draggable( 
					{ 
						helper: function()
						{
							var cloned = $(this).clone();
							//TODO: Make transparent and remove white area
							return cloned;
						}
						,
						revert: 'invalid'
					}
				);
			}
		);
	}
	//categorydroparea
	if( jQuery.fn.droppable )
	{
		console.log("droppable");
		
    	jQuery(".categorydroparea").livequery(
			function()
			{
				outlineSelectionCol = function(event, ui)
				{
					jQuery(this).addClass("dragoverselected");
				}
					
				unoutlineSelectionCol = function(event, ui)
				{
					jQuery(this).removeClass("dragoverselected");
				}
			
				jQuery(this).droppable(
					{
						drop: function(event, ui) 
						{
							console.log("dropped");
						
							var goalid = ui.draggable.data("goalid"); //Drag onto a category
							var node = $(this);
							var categoryid = node.parent().data("nodeid");

							node.removeClass("selected");
							var params = $(".projectgoals").data();
							params['goalid'] = goalid;
							params['targetcategoryid'] = categoryid;
							params['nodeID'] = $(".projectgoals").data("categoryid");
							
							jQuery.get(apphome + "/project/goals/drop/addtocategory.html", 
									params,
									function(data) 
									{
										$("#goaleditor").replaceWith(data);
									}
							);
						},
						tolerance: 'pointer',
						over: outlineSelectionCol,
						out: unoutlineSelectionCol
					}
				);
			}
		); //category
		
		
		 jQuery(".card-goal").livequery(
			function()
			{
				outlineSelectionCol = function(event, ui)
				{
					jQuery(this).addClass("dragoverselected");
				}
					
				unoutlineSelectionCol = function(event, ui)
				{
					jQuery(this).removeClass("dragoverselected");
				}
			
				jQuery(this).droppable(
					{
						drop: function(event, ui) 
						{
							console.log("dropped");
						
							var goalid = ui.draggable.data("goalid"); //Drag onto a category
							var card = $(this);
							var targetgoalid = card.data("goalid");
							
							var params = $(".projectgoals").data();
							params['goalid'] = goalid;
							params['targetgoalid'] = targetgoalid;
							
							jQuery.get(apphome + "/project/goals/drop/goalinsert.html", params ,
									function(data) 
									{
										//Reload goalist
										$("#resultsdiv").replaceWith(data);
									}
							);
						},
						tolerance: 'pointer',
						over: outlineSelectionCol,
						out: unoutlineSelectionCol
					}
				);
			}
		);
		
		} //droppable
	
	$("#commentsave").livequery("click",function()
	{
		var comment = $(this);
		var path = comment.data("savepath");
		var taskid = comment.data("taskid");
		var params = comment.data();
		params['comment'] = $("#commenttext").val();
		
		jQuery.get(path, params, function(data) 
		{
			$("#commentsarea_"+ taskid).html(data);
		});
					
	});
	
	$(".changetaskstatus").livequery(function()
	{
		var div = $(this);
		var select = div.find("select");
		select.on("change",function()
		{
			var path = div.data("savepath");
			var params = {}; //div.data();
			params['taskstatus'] = select.val();
			params['taskid'] = div.data("taskid");
			
			jQuery.get(path, params, function(data) 
			{
				div.replaceWith(data);
			});
		});
					
	});
	
});
