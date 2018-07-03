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
		
		//Sort Goals
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

		 //Sort tasks
		 jQuery("#editgoal .card-task").livequery(
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
			
				console.log("initi droppable");
				
				jQuery(this).droppable(
					{
						drop: function(event, ui) 
						{
							console.log("dropped");
						
							var taskid = ui.draggable.data("taskid"); //Drag onto a category
							var card = $(this);
							var targettaskid = card.data("taskid");
							
							var params = $("#tasklist").data();
							params['taskid'] = taskid;
							params['targettaskid'] = targettaskid;
							
							jQuery.get(apphome + "/project/goals/drop/taskinsert.html", params ,
									function(data) 
									{
										//Reload goalist
										$("#tasklist").replaceWith(data);
									}
							);
						},
						tolerance: 'pointer',
						over: outlineSelectionCol,
						out: unoutlineSelectionCol
					}
				);
			}
		); //Sort goals
		
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

	$("#changestatus").livequery(function()
	{
		var div = $(this);
		var select = div.find("select");
		select.on("change",function()
		{
			var path = div.data("path");
			var params = {}; //div.data();
			params['taskstatus'] = select.val();
			params['collectionid'] = div.data("collectionid");
			params['oemaxlevel'] = "1";
			console.log(path,params);
			jQuery.get(path, params, function(data) 
			{
				var statusviewer = $("#statusviewer");
				statusviewer.replaceWith(data);
			});
		});
					
	});

	
});
