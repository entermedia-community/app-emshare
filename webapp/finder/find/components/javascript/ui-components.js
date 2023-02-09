//EM Media Finder

formatHitCountResult = function(inRow) {
	return inRow[1];
}

function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function getScriptIfNotLoaded(scriptLocationAndName)
{
  var len = $('script[src*="' + scriptLocationAndName +'"]').length;

  //script already loaded!
  if (len > 0)
      return;

  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = scriptLocationAndName;
  head.appendChild(script);
}


finddata = function(inlink, inname)
{
	var item = $(inlink);
	var value = item.data(inname);
	if( !value )
	{
		value = inlink.attr(inname);
	}
	var parent = inlink;
	//debugger;
	while( !value)
	{
		parent = parent.parent().closest(".domdatacontext");
		if( parent.length == 0)
		{
			break;
		}
		value = parent.data(inname); 
	}
	return value;
}

findalldata = function(inlink)
{
	var item = $(inlink);
	var options = item.data();
	var parent = item;
	do
	{
		parent = parent.parent().closest(".domdatacontext");
		var moreoptions = parent.data();
		$.each( moreoptions, function( key, value ) { 
			if( !options[key] )
			{
				options[key] = value;
			}
		});
	}
	while( parent.length > 0 )
		
	return options;
}



runajaxonthis = function(inlink,e)
{
	
	$(".ajaxprogress").show();
	var inText = $(inlink).data("confirm");
	if(e && inText && !confirm(inText) )
	{
		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	inlink.attr('disabled','disabled');
	
	if( inlink.hasClass("activelistener") )
	{
		$(".activelistener").removeClass("active");
		inlink.addClass("active");
	}
	var nextpage= inlink.attr('href');
	if (!nextpage) {
		nextpage = inlink.data("nextpage");
	}

	var targetDiv = finddata(inlink,"targetdiv");
	var replaceHtml = true;
	
	/*
	 * Moved to always search targetdivinner
	if( !targetDiv )
	{
		targetDiv = finddata(inlink,"targetdivinner");
		if (targetDiv) {
			replaceHtml = false;
		}
	}*/	
	
	var targetDivInner = finddata(inlink,"targetdivinner");
	if (!targetDiv && targetDivInner) {
		targetDiv = targetDivInner;
		replaceHtml = false;
	}
	
	var useparent = inlink.data("useparent");

	if( inlink.hasClass("auto-active-link" ) )
	{
		var container = inlink.closest(".auto-active-container");
		
		jQuery(".auto-active-row",container).removeClass("current");	
		var row = inlink.closest(".auto-active-row");
		row.addClass("current");

		jQuery("li",container).removeClass("current");
		var row = inlink.closest("li");
		row.addClass("current");

	}
	var options = findalldata(inlink); //--
	
	inlink.css( "cursor","wait");
	$("body").css( "cursor","wait");
	
	var inlinkmodal = inlink.closest(".modal");

	if( targetDiv)
	{
		targetDiv = targetDiv.replace(/\//g, "\\/");
		
		jQuery.ajax({
			url: nextpage, data: options, success: function (data) {
				var cell;
				if(useparent && useparent == "true")
				{
					cell = $("#" + targetDiv, window.parent.document);
				}
				else
				{
					cell = findclosest(inlink,"#" + targetDiv); 
					
				}
				if (replaceHtml) {
					//Call replacer to pull $scope variables
					cell.replaceWith(data); //Cant get a valid dom element
				}
				else {
					cell.html(data);
				}
				
			},
			type: "POST",
			dataType: 'text',
			xhrFields: {
                withCredentials: true
            },
			crossDomain: true
		}).always(function(){
			
			if (typeof global_updateurl !== "undefined" && global_updateurl == false) {
				//globaly disabled updateurl
			}
			else {
				var updateurl = inlink.data("updateurl");
				if( updateurl)	{
					//console.log("Saving state ", updateurl);
					history.pushState($("#application").html(), null, nextpage);
					window.scrollTo(0, 0);
				}
				
				//window.addEventListener("hashchange", function(e) { reload using ajax
			}
			
			$(".ajaxprogress").hide();
			//inlink.css("enabled",true);
			inlink.removeAttr('disabled');
			//Close Dialog
			var closedialog = inlink.data("closedialog");
			if (closedialog && inlinkmodal != null) {
					inlinkmodal.modal("hide");
			}
			//Close MediaViewer
			var closemediaviewer = inlink.data("closemediaviewer");
			if (closemediaviewer) {
				var overlay = $("#hiddenoverlay");
				if (overlay.length) {
					hideOverlayDiv(overlay);
				}
			}
			//Close Navbar if exists
			var navbar = inlink.closest(".navbar-collapse");
			if(navbar) {
				navbar.collapse('hide');
			}
			
			$(window).trigger( "resize" );
		});
		
		
	}	
	else
	{
		/*
		//add oemaxlevel as data
		var loaddiv = inlink.data("targetdivinner");
		if( !loaddiv )
		{
			loaddiv = inlink.attr("targetdivinner");
		}
		loaddiv = loaddiv.replace(/\//g, "\\/");
		//$("#"+loaddiv).load(nextpage);
		jQuery.get(nextpage, options, function(data) 
				{
					var cell;
					
					if(useparent && useparent == "true")
					{
						cell = $("#" + loaddiv, window.parent.document);
					}
					else
					{
						cell = findclosest(inlink,"#" + loaddiv);
					}
					cell.html(data);
					$(window).trigger( "resize" );
				}).always(function()
						{
					$(".ajaxprogress").hide();

							//inlink.css("enabled",true);
							inlink.removeAttr('disabled');
						});		
		*/
	}
	
	inlink.css( "cursor","");
	$("body").css( "cursor","");

}
runajax = function(e)
{
	 e.stopPropagation();
     e.preventDefault();
	runajaxonthis($(this),e);
	return false;
}

uiload = function() {
	
	// https://github.com/select2/select2/issues/600
	//$.fn.select2.defaults.set("theme", "bootstrap4");
	//$.fn.modal.Constructor.prototype._enforceFocus = function() {
	//}; // Select2 on Modals
	
	var app = jQuery("#application");
	var apphome = app.data("siteroot") + app.data("apphome");
	var themeprefix = app.data("siteroot") + app.data("themeprefix");
	
	if ($.fn.tablesorter) {
		$("#tablesorter").tablesorter();
	}
	if ($.fn.selectmenu) {
		lQuery('.uidropdown select').livequery(function() {
			$(this).selectmenu({
				style : 'dropdown'
			});
		});
	}

	lQuery("a.ajax").livequery('click', runajax);

	var browserlanguage = app.data("browserlanguage");
	if (browserlanguage == undefined || browserlanguage == "") {
		browserlanguage = "en";
	}
	
	if ($.datepicker) {
		lQuery("input.datepicker").livequery(function() {
            var dpicker = $(this);
			$.datepicker.setDefaults( $.datepicker.regional[browserlanguage] );
			$.datepicker.setDefaults($.extend({
				showOn : 'button',
				buttonImage :  themeprefix + '/entermedia/images/cal.gif',
				buttonImageOnly : true,
				changeMonth : true,
				changeYear : true,
				yearRange : '1900:2050'
			})); // Move this to the Layouts?
			
            var targetid = dpicker.data("targetid");
			dpicker.datepicker({
				altField : "#" + targetid,
				altFormat : "yy-mm-dd",
                yearRange : '1900:2050',
                beforeShow: function (input, inst) {
                    setTimeout(function () {
                    	$('#application').append($('#ui-datepicker-div'));
                        //Fix Position if in bootstrap modal
						var modal = $("#modals");
                        if (modal.length) {
							var modaltop = $("#modals").offset().top;
							if (modaltop) {
	                            var dpickertop = dpicker.offset().top;
	                            dpickertop = dpickertop-modaltop;
	                            var dpHeight = inst.dpDiv.outerHeight();
	                            var inputHeight = inst.input ? inst.input.outerHeight() : 0;
	                            var viewHeight = document.documentElement.clientHeight;
	                            if ((dpickertop+dpHeight+inputHeight) > viewHeight)
	                            {
	                               dpickertop = dpickertop-dpHeight;
	                            }
	                            inst.dpDiv.css({
	                                top: dpickertop+inputHeight
	                            });
							}
                        }
                        
                    }, 0);
                }
			});
			

			var current = $("#" + targetid).val();
			if (current != undefined) {
				// alert(current);
				var date;
				if (current.indexOf("-") > 0) // this is the standard
				{
					current = current.substring(0, 10);
					// 2012-09-17 09:32:28 -0400
					date = $.datepicker.parseDate('yy-mm-dd', current);
				} else {
					date = $.datepicker.parseDate('mm/dd/yy', current); // legacy
																		
				}
				$(this).datepicker("setDate", date);
			}
			$(this).blur(function() {
				var val = $(this).val();
				if (val == "") {
					$("#" + targetid).val("");
				}
			});
		});
	}//datepicker
	
	if ($.fn.minicolors) {
		$(".color-picker").minicolors({
			defaultValue : '',
			letterCase : 'uppercase'
		});
	}
	
	lQuery('.focusme').livequery(function(){
		$(this).focus();
	})
	
	lQuery('#module-dropdown').livequery("click", function(e) {
		e.stopPropagation();
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
			$('#module-list').hide();
		} else {
			$(this).addClass('active');
			$('#module-list').show();
		}
	});
	
	lQuery("select.select2").livequery(function() {
		var theinput = $(this);
		var dropdownParent = theinput.data('dropdownparent');
		if (dropdownParent && $("#" + dropdownParent).length) {
			dropdownParent = $("#" + dropdownParent);
		}
		else {
			dropdownParent = $(this).parent();
		}
		var parent = theinput.closest("#main-media-container");
		if (parent.length) {
			dropdownParent = parent;
		} 
		var parent = theinput.parents(".modal-content");
		if (parent.length) {
			dropdownParent = parent;
		}
		var allowClear = $(this).data('allowclear');
		if (allowClear == undefined)  {
			allowClear = true;
		}
		var placeholder = $(this).data('placeholder');
		if( placeholder  == undefined)
		{
			placeholder = "...";
		}
		theinput.select2({
			allowClear : allowClear,
			placeholder: placeholder,
			dropdownParent : dropdownParent
		});
		
		theinput.on("select2:open", function(e) {
			var selectId = $(this).attr("id");
			if(selectId) {
				$(".select2-search__field[aria-controls='select2-" + selectId + "-results']").each(function (key, value) {
				        value.focus()
				})
			}
			else {
				document.querySelector(".select2-container--open .select2-search__field").focus()
			}
		});
		
	});
	/*
	$(".select2simple").select2({
		 minimumResultsForSearch: Infinity
	});
	*/
	lQuery("select.listdropdown").livequery(function() {
		var theinput = $(this);
		var dropdownParent = theinput.data('dropdownparent');
		if (dropdownParent && $("#" + dropdownParent).length) {
			dropdownParent = $("#" + dropdownParent);
		}
		else {
			dropdownParent = $(this).parent();
		}
		var parent = theinput.closest("#main-media-container");
		if (parent.length) {
			dropdownParent = parent;
		}
		var parent = theinput.parents(".modal-content");
		if (parent.length) {
			dropdownParent = parent;
		}
	
            //console.log(theinput.attr("id")+"using: "+dropdownParent.attr("id"));
			var placeholder = theinput.data('placeholder');
			if (!placeholder) {
				placeholder = '';
			}
            var allowClear = theinput.data('allowclear');

            if (allowClear == undefined)  {
                allowClear = true;
            }
			theinput = theinput.select2({
				placeholder : placeholder,
				allowClear : allowClear,
				minimumInputLength : 0,
				dropdownParent : dropdownParent
			});

			theinput.on("change", function(e) {
				//console.log("XX changed")
				if (theinput.hasClass("uifilterpicker")) 
				{
					var selectedids = theinput.val();
					if( selectedids )
					{
						//console.log("XX has class" + selectedids);
						var parent = theinput.closest(".filter-box-options");
						//console.log(parent.find(".filtercheck"));
						parent.find(".filtercheck").each(function()
						{
							
							var filter = $(this);
							filter.prop("checked",false); //remove?
						});
						for (i=0;i<selectedids.length;i++){
							//$entry.getId()${fieldname}_val
							var selectedid = selectedids[i];
							var fieldname = theinput.data("fieldname");
							var targethidden = $("#" + selectedid + fieldname + "_val");
							targethidden.prop("checked",true);
						}
					}
				}
			});
			
			theinput.on("select2:open", function(e) {
				var selectId = $(this).attr("id");
				if(selectId) {
					$(".select2-search__field[aria-controls='select2-" + selectId + "-results']").each(function (key, value) {
					        value.focus()
					})
				}
				else {
					document.querySelector(".select2-container--open .select2-search__field").focus()
				}
			});;

	});

	lQuery(".select2editable").livequery(function() {
		var input = $(this);
		var arr = new Array(); // [{id: 0, text: 'story'},{id: 1, text:
								// 'bug'},{id: 2, text: 'task'}]

		

		var options = $(this).find('option');

		if (!options.length) {
//			return;
		}

		options.each(function() {
			var id = $(this).data('value');
			var text = $(this).text();
			 //console.log(id + " " + text);
			arr.push({
				id : id,
				text : text
			});
		});

		// Be aware: calling select2 forces livequery to filter again
		input.select2({
			createSearchChoice : function(term, data) {
				if ($(data).filter(function() {
					return this.text.localeCompare(term) === 0;
				}).length === 0) {
					//console.log("picking" + term);
					return {
						id : term,
						text : term
					};
				}
			},
			multiple : false,
			tags: true	
			
		})
		.on('select2:select', function (e) {
			var thevalue = $(this).val();
			if (thevalue != '' && $(this).hasClass("autosubmited")) {
				var theform =$(this).parent("form")
				if (theform.hasClass("autosubmitform")) {
					theform.trigger("submit");
				}
			}
        	
    	});
		
		input.on("select2:open", function(e) {
			var selectId = $(this).attr("id");
			if(selectId) {
				$(".select2-search__field[aria-controls='select2-" + selectId + "-results']").each(function (key, value) {
				        value.focus()
				})
			}
			else {
				document.querySelector(".select2-container--open .select2-search__field").focus()
			}
		});
		
	});

	lQuery("select.ajax").livequery('change', function(e) {
		var inlink = $(this);
		var nextpage = inlink.data('href');
		nextpage = nextpage + inlink.val();
		var targetDiv = inlink.data("targetdiv");
		if (!targetDiv) {
			targetDiv = inlink.attr("targetdiv");
		}
		
		
		var options = inlink.data();
		options[inlink.attr("name")] = inlink.val();
		$.get(nextpage, options, function(data) {
			if (targetDiv) {
			var cell = $("#" + targetDiv);
			cell.html(data);
			}
			else {
				if (!targetDiv) {
					targetDiv = inlink.data("targetdivinner");
					var cell = $("#" + targetDiv);
					cell.replaceWith(data);
				}
			}
			$(window).trigger("resize");
		});
	});

	lQuery("a.toggle-visible").livequery('click', function(e) {
		e.preventDefault();
		var div = $(this).data("targetdiv");
		var target = $("#" + div);
		if (target.is(":hidden")) {
			var hidelable = $(this).data("hidelabel");
			$(this).find("span").text(hidelable);
			target.show();
		} else {

			var showlabel = $(this).data("showlabel");
			$(this).find("span").text(showlabel);
			target.hide();
		}
	});

	// deprecated, use data-confirm
	lQuery(".confirm").livequery('click', function(e) {
		
		var inText = $(this).attr("confirm");
		if (!inText) {
			inText = $(this).data("confirm");
		}
		if (confirm(inText)) {
			return;
		} else {
			e.preventDefault();
		}
	});

	lQuery(".uibutton").livequery(function() {
		$(this).button();
	});
	lQuery(".fader").livequery(function() {
		$(this).fadeOut(2000, "linear");
	});

	lQuery(".uipanel").livequery(
			function() {
				$(this).addClass("ui-widget");
				var header = $(this).attr("header");
				if (header != undefined) {
					// http://dev.$.it/ticket/9134
					$(this).wrapInner('<div class="ui-widget-content"/>');
					$(this).prepend(
							'<div class="ui-widget-header">' + header
									+ '</div>');
				}
			});

	lQuery(".ajaxchange select").livequery(function() {
		var select = $(this);
		var div = select.parent(".ajaxchange")
		var url = div.attr("targetpath");
		var divid = div.attr("targetdiv");

		select.change(function() {
			var url2 = url + $(this).val();
			$("#" + divid).load(url2);
		});
	});

	lQuery("form.ajaxform").livequery(
			'submit', // Make sure you use
						// $(this).closest("form").trigger("submit")
			function(e) {

				e.preventDefault();
				e.stopImmediatePropagation();

				if( CKEDITOR )
				{
					for (instance in CKEDITOR.instances) 
					{
			         var editor = CKEDITOR.instances[instance];
			         var div = $(editor.element.$);
			         var id = div.data("saveto");
			         var tosave = $("#" + id);
			         //editor.updateElement() //does not work
			         var data = editor.getData();
			         tosave.val(data);
					}
				}
				
				var form = $(this);

				if (form.validate && !form.hasClass("novalidate")) {
					form.validate({
						ignore : ".ignore"
					});
					var isvalidate = form.valid();
					if (!isvalidate) {
						e.preventDefault();
						// show message
						return;
					}
				}
				var targetdiv = form.data("targetdiv");
				if (targetdiv  === undefined) {
					targetdiv = form.attr("targetdiv");
				}
				if (targetdiv  === undefined) {
					targetdiv = form.data("targetdivinner");
				}
				targetdiv = $("#"+$.escapeSelector(targetdiv));
				if(form.attr("action") == undefined) {
					var action = targetdiv.data("saveaction");
					if(action == undefined) {
						action = form.data("defaultaction");
					}
					form.attr("action", action);
				}

				if (form.hasClass("showwaiting")) {
					var apphome = app.data("siteroot") + app.data("apphome");
					var showwaitingtarget = targetdiv;
					if (form.data("showwaitingtarget")) {
						showwaitingtarget = form.data("showwaitingtarget");
						showwaitingtarget = $("#"+$.escapeSelector(showwaitingtarget));
					}
					showwaitingtarget.html(
							'<img src="' + apphome
									+ '/theme/images/ajax-loader.gif">');
				}
				
				var oemaxlevel = targetdiv.data("oemaxlevel");
				if(oemaxlevel == undefined) {
					oemaxlevel = form.data("oemaxlevel");
				}
				if(oemaxlevel == undefined) {
					oemaxlevel = 1;
				}
				//targetdiv.data("oemaxlevel", oemaxlevel);

				var data = {};
				if(form.data("includesearchcontext") == true){
					data = jQuery("#resultsdiv").data();
					data.oemaxlevel = oemaxlevel;
				}
				else{
					if (targetdiv.data()  !== undefined) {
						data = targetdiv.data();
					}
				} 
				
				data.oemaxlevel = oemaxlevel;
				
				var formmodal = form.closest(".modal");
				
				form.ajaxSubmit({
					data : data,
					xhrFields: {
		                withCredentials: true
		            },
					crossDomain: true,
					error : function(data) {
						alert("error");
						if (targetdiv) {
							$("#" + $.escapeSelector(targetdiv)).html(data);
						}
						form.append(data); 
						// $("#" + targetdiv).replaceWith(data);
					},
					success : function(result, status, xhr, $form) 
					{
						var targetdivinner = form.data("targetdivinner");
						if( targetdivinner )
						{
							$("#" + $.escapeSelector(targetdivinner)).html(result);
						}
						else
						{		
							if (targetdiv) {
								targetdiv.replaceWith(result);
							}
					 	}
						if (formmodal.length > 0 && form.hasClass("autocloseform")) {
		                    if (formmodal.modal) {
		                    	closeemdialog(formmodal);
		                    }
		                }
		        		$('#resultsdiv').data('reloadresults',true);

		                //TODO: Move this to results.js
		                if (form.hasClass("autohideOverlay")) {
		                	hideOverlayDiv(getOverlay());
		                }
						
		                if (form.hasClass("autoreloadsource")) 
		                {
		                    var link = form.data("openedfrom")
		                    if( link)
		                    {
		                    	window.location.replace(link); 
		                    }
		                }
		                $(window).trigger( "resize" );
		                
		                //experimental
		                if(form.data("onsuccess")) {
		                	var onsuccess = form.data("onsuccess");
		                	var fnc = window[onsuccess];
		                	if( fnc && typeof fnc === "function" ) {  //make sure it exists and it is a function
		                	    fnc(form);  //execute it
		                	}
		                }
		                
		                //experimental
		                if(form.data("onsuccessreload")) {
		                	document.location.reload(true)
		                }
		                
		                if (typeof global_updateurl !== "undefined" && global_updateurl == false) {
		        			//globaly disabled updateurl
		        		}
		        		else {
		        			//Update Address Bar
	        				var updateurl = form.data("updateurl");
	        				if( updateurl)	{
	        					//serialize and attach
	        					var params = form.serialize();
	        					var url = form.attr("action");
	        					url += (url.indexOf('?') >= 0 ? '&' : '?') + params;
	        					history.pushState($("#application").html(), null, url);
	        					window.scrollTo(0, 0);
	        				}
		        		}
		                
					}
				});


				var reset = form.data("reset")
				if (reset == true) {
					form.get(0).reset();
				}
				return false;
			});

	lQuery("form.autosubmit").livequery(function() {
		var form = $(this);
		var targetdiv = form.data('targetdiv');
		$("select",form).change(function() {
			$(form).ajaxSubmit({
				target : "#" + $.escapeSelector(targetdiv) 
			});
		});
		$("input",form).on("focus", function(event) {
			$("#"+$.escapeSelector(targetdiv)).show();
		});
		
		$("input",form).on("keyup", function(event) {
			
				$(form).ajaxSubmit({
					target : "#" + $.escapeSelector(targetdiv)
				});
			
		});
		$('input[type="file"]',form).on("change", function() {
			$(form).ajaxSubmit({
				target : "#" + $.escapeSelector(targetdiv)
			});
		});
		$('input[type="checkbox"]',form).on("change", function() {
			$(form).ajaxSubmit({
				target : "#" + $.escapeSelector(targetdiv)
			});
		});
		

	});
	
	lQuery("select.ajaxautosubmitselect").livequery(function() {
		var select = $(this);
		select.change(function() {
			var targetdiv = select.data("targetdiv");
			var link = select.data("url");
			var param = select.data("parametername");
			
			var url = link + "?" + param + "=" + select.val();
			
			var options = select.data();
			$("#" + targetdiv).load(url, options, function() {
				
			});
			
		});
	});
	

	lQuery("form.ajaxautosubmit").livequery(function() {
		var theform = $(this);
		theform.find("select").change(function() {
			theform.submit();
		});
	});

	lQuery(".submitform").livequery("click", function(e) {
		e.preventDefault();
		var theform = $(this).closest('form');
		console.log("Submit Form " + theform);
		theform.trigger("submit");
	});
	
	lQuery(".submitform-oehtml, .dialogsubmitbtn").livequery('click',
			function(e) {
				var theform = $(this).closest('form');
				if (theform.length == 0) {
					//dialog form?
					var dialogform = $(this).attr("form");
					theform = $("#"+dialogform);
				}
				if (theform.length) {
					theform.data("readytosubmit","true"); 
					theform.find(".oehtmlinput").trigger("blur");
					theform.trigger("submit");
				}
				e.preventDefault();
			});
	
	lQuery(".selectsubmitform").livequery("change", function(e) {
		e.preventDefault();
		var theform = $(this).closest('form');
		theform.trigger("submit");
	});

	lQuery(".quicksearch-toggler").livequery("click", function() {
		var navbar = $(this).data('target');
		$('#' + navbar).toggle();

	});
		
	
	emdialog = function(dialog, event) {
		if( event )
		{
			event.stopPropagation();
		}
		var dialog = dialog;
		var hidescrolling = dialog.data("hidescrolling");

		var width = dialog.data("width");
		var maxwidth = dialog.data("maxwidth");
		/*if (!width) {
			width = "800";
		}*/
		var id = dialog.data("dialogid");
		if (!id) {
			id = "modals";	
		}
		
		var modaldialog = $("#" + id);
		if (modaldialog.length == 0) {
			jQuery("#application").append(
					'<div class="modal " tabindex="-1" id="' + id
							+ '" style="display:none" ></div>');
			modaldialog = jQuery("#" + id);
		}
		var link = dialog.attr("href");
		if(!link) {
			link = dialog.data("emdialoglink");
		}
		var options = dialog.data();
		var param = dialog.data("parameterdata");
		if (param) {
			var element = jQuery("#" + param);
			var name = element.prop("name");
			options[name] = element.val();
		}
		var openfrom = window.location.href;
		
		jQuery.ajax({
			xhrFields: {
                withCredentials: true
            },
			crossDomain: true,
			url: link,
			options: options,
			success: function(data) {
				
				//--
				modaldialog.html(data);
				
				if (width) {
					
					if( width >  $(window).width() )
					{
						width =  $(window).width();
					}
					
					$(".modal-lg").css("min-width", width + "px");
				}
				if (maxwidth) {
					$(".modal-lg").css("max-width", maxwidth + "px");
				}
				// $(".modal-lg").css("min-height",height + "px" );
				
				var modalkeyboard = true;
				var noesc = dialog.data("noesc");
				if (noesc != null && noesc == true) {
					 modalkeyboard = false;
				}
				//Verify if modal was open on top of Asset Media Viewer
				if(modalkeyboard) {
					var mainmedia = $("#hiddenoverlay");
					if(mainmedia.length  && mainmedia.hasClass("show")) {
						modalkeyboard = false;
					}
				}
				
				var modalinstance;

				modalinstance = modaldialog.modal({
						keyboard : modalkeyboard,
						backdrop : 'static',
						closeExisting: false,
						"show" : true
				});
				
				jQuery('.modal-backdrop').insertAfter(modalinstance);
					
				var firstform = $('form', modaldialog);
				firstform.data("openedfrom", openfrom);
				// fix submit button
				var justok = dialog.data("cancelsubmit");
				if (justok != null) {
					$(".modal-footer #submitbutton", modaldialog).hide();
				} else {
					var id = $("form", modaldialog).attr("id");
					$("#submitbutton", modaldialog).attr("form", id);
				}
				var hidetitle = dialog.data("hideheader");
				if( hidetitle == null)
				{
					var title = dialog.attr("title");
					if (title == null) {
						title = dialog.text();
					}
					$(".modal-title", modaldialog).text(title);
				}	
				var hidefooter = dialog.data("hidefooter");
				if (hidefooter != null) {
					$(".modal-footer", modaldialog).hide();
				}
				var focuselement = dialog.data("focuson");
	
				if (focuselement) {
					//console.log(focuselement);
					var elmnt = document.getElementById(focuselement);
					elmnt.scrollIntoView();
				} else {
					$('form', modaldialog).find('*').filter(
							':input:visible:first').focus();
				}
				
				if (typeof global_updateurl !== "undefined" && global_updateurl == false) {
					//globaly disabled updateurl
				}
				else {
					//Update Address Bar
					var updateurl = dialog.data("urlbar");
					if( !updateurl )
					{
						updateurl = dialog.data("updateurl");
					}
					if( updateurl)	{
							history.pushState($("#application").html(), null, link);
							window.scrollTo(0, 0);
					}
				}
				
				modalinstance.on('hidden.bs.modal', function () {
					$(window).trigger("resize");
				});
			}
		});
		
		//Close drodpown if exists
		if (dialog.closest('.dropdown-menu').length !== 0) {
			dialog.closest('.dropdown-menu').removeClass('show');
		}
		if( event )
		{
			event.preventDefault();
		}	
		
		return false;
	}
	
	lQuery("a.openemdialog").livequery( function() {
		var link = $(this);
		//link[0].click();
		emdialog($(this), event);
		//link.trigger("click");
	});
	
	
	lQuery("a.emdialog").livequery(
			"click", function(event) {
				emdialog($(this), event);
	});
	
	lQuery(".closemodal").livequery("click", function(event) {
		closeemdialog($(this).closest(".modal"));
	});
	
	closeemdialog = function(modaldialog) {
		if (modaldialog.modal) {
			modaldialog.modal("hide");
		}
	}
	
	
	var lasttypeahead;
	var lastsearch;
	
	lQuery(".typeaheaddropdown").livequery(function() {  //TODO: Move to results.js
		
		var input = $(this);

		var hidescrolling = input.data("hidescrolling");

		
		var id = input.data("dialogid");
		if (!id) {
			id = "typeahead";	
		}
		
		var modaldialog = $("#" + id);
		if (modaldialog.length == 0) {
			input.parent().append(
					'<div class="typeaheadmodal" tabindex="-1" id="' + id
							+ '" style="display:none" ></div>');
			modaldialog = $("#" + id);
		}
		
		var width = input.width();
		var minwidth = input.data("minwidth");

		if (minwidth && width) {
			if( minwidth >  width )
			{
				width =  minwidth;
			}
		}
		
		modaldialog.css("width", width + "px");
		var topposition =  input.height() + 5;
		modaldialog.css("top", topposition+"px");
		modaldialog.css("left", input.position().left+"px");

		var options = input.data();
		
		var searchurltargetdiv = input.data("searchurltargetdiv");
			
		var typeaheadtargetdiv = input.data("typeaheadtargetdiv");
		if(typeaheadtargetdiv == null) {
			typeaheadtargetdiv = "applicationmaincontent"
		}	
		
		var searchurlentertargetdiv = input.data("searchurlentertargetdiv");
		
		var moduleid = $("#applicationcontent").data("moduleid");
		var searchurl = apphome + "/views/modules/" + moduleid + "/index.html";

		options["moduleid"] = moduleid;
		
		var updateurl = input.data("updateurl");

		if(searchurlentertargetdiv != null)
		{
			input.on("keydown", function(e)
			{
				var q = input.val();
				q = q.trim();
				
				var moduleid = $("#applicationcontent").data("moduleid");
				var searchurl = apphome + "/views/modules/" + moduleid + "/index.html";

				options["moduleid"] = moduleid;
	
				if( e.which == 13)
				{
					e.preventDefault();
					modaldialog.hide();
					if (q == null || q=="") {
						return;
					}
					input.data("searching","true");
					input.css( "cursor","wait");
					$("body").css( "cursor","wait");
					
					//Show results below
					//console.log("enter running " + q);
					options["oemaxlevel"] = input.data("searchurlenteroemaxlevel");
					//var updateurl = input.data("updateurl");
	
					$.ajax({ url: searchurl, async: true, data: options, 
						success: function(data) 
						{
							input.data("searching","false");
							if(data) 
							{
								var q2 = input.val();
								if( q2 == q)
								{
									
									if (typeof global_updateurl !== "undefined" && global_updateurl == false) {
										//globaly disabled updateurl
									}
									else {
										if( updateurl )
										{
											history.pushState($("#application").html(), null, searchurl);
											window.scrollTo(0, 0);
										}
									}
									$("#"+searchurlentertargetdiv).html(data);
										
									$(window).trigger("resize");
								}	
							}
						}	
						,
						complete:  function(data) 
						{
							input.data("searching", "false");
							$("body").css( "cursor","");
							input.css( "cursor","");
						}
					});
				}
			});
		}
		input.on("keyup", function(e) //Keyup sets the value first 
		{
			var q = input.val();
			q = q.trim();
			options["description.value"] = q;
			
			var moduleid = $("#applicationcontent").data("moduleid");
			var searchurl = apphome + "/views/modules/" + moduleid + "/index.html";

			options["moduleid"] = moduleid;
			
			
			if( q && q.length < 2)
			{
				return;
			}
			if( q.endsWith(" "))
			{
				return;
			}
			var url = input.data("typeaheadurl");
			//console.log("Keyup" + e.which);
			if( e.which == 27) //Tab?
			{
				modaldialog.hide();	
			}
			else if(q != "" && (e.which == 8 || (e.which != 37 && e.which != 39 && e.which > 32) ) ) //Real words and backspace
			{
				//console.log("\"" + q + "\" type aheading on " + e.which);
				//Typeahead
				if( lasttypeahead )
				{
					lasttypeahead.abort();
				}
				//Typeahead ajax call
				lasttypeahead = $.ajax(
				{ 
					url: url, async: true, 
					data: options,
					timeout: 5000,
					success: function(data) 
					{
						if(data) 
						{
							modaldialog.html(data);
							var lis = modaldialog.find("li");
							if( lis.length > 0)
							{
								//modaldialog.css("min-height",lis.length * 42 + 25);
								modaldialog.show();
							}
							else
							{
								modaldialog.hide();
							}
						}	
					}
				});

				var searching = input.data("searching");
				if( searching == "true")
				{
					//console.log("already searching"  + searching);
				}
				if (searchurl != null) {
					console.log(q + " searching");
					input.data("searching","true");
					
					if( lastsearch )
					{
						lastsearch.abort();
					}
					options["oemaxlevel"] = input.data("oemaxlevel");
					//Regular Search Ajax Call
					lastsearch = $.ajax({ url: searchurl, async: true, data: options, 
						success: function(data) 
						{
							input.data("searching","false");
							//if(data) 
							{
								//var q2 = input.val();
								//if( q2 == q)
								{
									$("#"+searchurltargetdiv).html(data);
									$(window).trigger("resize");
								}	
							}
						}
						,
						complete:  function(data) 
						{
							input.data("searching","false");
							input.css( "cursor","");
						}
					});
				}
			}
		});
		
		jQuery("body").on("click", function(event){
			modaldialog.hide();
		});
	});
	
	

	lQuery('.emrowpicker table td').livequery("click", function(event) {
		event.preventDefault();

		var clicked = $(this);
		var row = clicked.closest("tr");
		var table = clicked.closest("table");
		var form = clicked.closest("form");
		
		var existing = row.hasClass("emrowselected");
		if (!form.hasClass("emmultivalue")) {
			$("tr",table).removeClass("emrowselected");
		}
		row.toggleClass("emrowselected");
		var id = row.data("id");

		
		$('.emselectedrow', form).each(function() {
			if (form.hasClass("emmultivalue")) {
				var old = $(this).val();
				if (old) {
					if (existing) // removing the value
					{
						old = old.replace(id, "");
						old = old.replace("||", "|");
					} else {
						old = old + "|" + id;
					}
				} else {
					old = id;
				}
				$(this).val(old);
			} else {
				$(this).val(id);
			}
		});

		
		form.trigger("submit");
		
		
		if (form.hasClass("autoclose")) {
			closeemdialog(form.closest(".modal"));
		}

	});

	lQuery('#emselectable table td').livequery("click", function(event) {
		var clicked = $(this);
		if (clicked.attr("noclick") == "true") {
			return true;
		}
		if ($(event.target).is("input")) {
			return true;
		}
		var emselectable = clicked.closest("#emselectable");
		if (!emselectable) {
			emselectable = clicked.closest(".emselectable");
		}
		var row = $(clicked.closest("tr"));
		if (row.hasClass("thickbox")) {
			var href = row.data("href");
			openFancybox(href);
		} else {
			emselectable.find('table tr').each(function(index) {
				clicked.removeClass("emhighlight");
			});
			row.addClass('emhighlight');
			row.removeClass("emborderhover");
			var table = row.closest("table");
			var id = row.attr("rowid");
			
			// var url = emselectable.data("clickpath");
			
			var url = table.data("clickpath");
			var form = emselectable.find("form");
			var data = row.data();

			//--Form
			if (form.length > 0) {
				emselectable.find('#emselectedrow').val(id);
				emselectable.find('.emneedselection').each(function() {
					clicked.removeAttr('disabled');
				});
				//form.submit();
				var targetdiv = form.data("targetdiv");
				if ((typeof targetdiv) != "undefined") {
					$(form).ajaxSubmit({
						target : "#" + $.escapeSelector(targetdiv), 
						data:data
						
					});
				} else {
					$(form).trigger("submit");
				}
				if (form.hasClass("autoclose")) {
					closeemdialog(form.closest(".modal"));
				}
			} else if (url != undefined) {
				//-- table clickpath
				if (url == "") {
					return true;
				}
				var link = url;
				var post = table.data("viewpostfix");
				if (post != undefined) {
					link = link + id + post;
				} else {
					link = link + id;
				}
				if (emselectable.hasClass("showmodal")) {
					showmodal(emselectable, link);
				} else {
					parent.document.location.href = link;
				}
			} else {
				//--clickurl on emselectable
				var targetdiv = '';
				var options = null;
				var clickurl = emselectable.data("clickurl");
				if(clickurl){
					options = emselectable.data();
					options.id = row.attr("rowid");
				}
				else if (!clickurl) {
					//search domdatacontext :: Move all tables to use domdatacontext
					clickurl = finddata(emselectable, "clickurl");
					if (clickurl && clickurl != "") {
						//Get everything from domadatacontext
						options = findalldata(emselectable);
						targetdiv = finddata(emselectable, "targetdiv");
						if (!targetdiv) {
							targetdiv = finddata(emselectable, "targetdivinner");
						}
						//options = row.data();
						options.id = row.attr("rowid");
						options.oemaxlevel =  finddata(emselectable, "oemaxlevel");
					}
				}
				if (clickurl && clickurl != "") {
					if (!targetdiv) {
						targetdiv = emselectable.data("targetdiv");
					}
					if (!targetdiv) {
						targetdiv = emselectable.data("targetdivinner");
					}
					if(targetdiv != '') {
						jQuery.ajax({
							url:  clickurl,
							data: options,
							success: function(data) {
								$("#"+targetdiv).html(data);
							}
						});
						
					}
					return;
				}
				//verify if is entity dialog
				var emdialoglink = emselectable.data("emdialoglink");
				if (emdialoglink && emdialoglink != "") {
					emdialoglink = emdialoglink + "&id="+id;
					row.data("emdialoglink", emdialoglink);
					row.data("id", id);
					row.data("searchtype", emselectable.data("searchtype"));
					emdialog(row, event);
				}
				else if(id!="") {
					//legacy refresh window
					parent.document.location.href = id;
				}
			}
		}
	});

	showmodal = function(emselecttable, url) {
		var id = "modals";
		var modaldialog = $("#" + id);
		var width = emselecttable.data("dialogwidth");
		if (modaldialog.length == 0) {
			$("#emcontainer").append(
					'<div class="modal " tabindex="-1" id="' + id
							+ '" style="display:none" ></div>');
			modaldialog = $("#" + id);
		}

		var options = emselecttable.data();
		modaldialog.load(url, options, function() {
			$(".modal-lg").css("min-width", width + "px");
			modaldialog.modal({
				keyboard : true,
				backdrop : true,
				"show" : true
			});

			var title = emselecttable.data("dialogtitle");
			if (title) {
				$(".modal-title", modaldialog).text(title);
			}

			$('form', modaldialog).find('*').filter(':input:visible:first')
					.focus();

		});
	}

	lQuery("img.framerotator").livequery(
			function() {
				$(this).hover(
						function() {
							$(this).data("frame", 0);
							var path = this.sr$('select#speedC').selectmenu({
								style : 'dropdown'
							});
							c.split("?")[0];
							var intval = setInterval("nextFrame('" + this.id
									+ "', '" + path + "')", 1000);
							$(this).data("intval", intval);
						}, function() {
							var path = this.src.split("?")[0];
							this.src = path + '?frame=0';
							var intval = $(this).data("intval");
							clearInterval(intval);
						});
			});

	lQuery(".jp-play").livequery("click", function() {

		// alert("Found a player, setting it up");
		var player = $(this).closest(".jp-audio").find(".jp-jplayer");
		var url = player.data("url");
		var containerid = player.data("container");
		var container = $("#" + containerid);

		player.jPlayer({
			ready : function(event) {
				player.jPlayer("setMedia", {
					mp3 : url
				}).jPlayer("play");
			},
			play : function() { // To avoid both jPlayers playing together.
				player.jPlayer("pauseOthers");
			},
			swfPath : apphome + '/components/javascript',
			supplied : "mp3",
			wmode : "window",
			cssSelectorAncestor : "#" + containerid
		});

		// player.jPlayer("play");

	});

	lQuery('.select-dropdown-open').livequery("click", function() {
		if ($(this).hasClass('down')) {
			$(this).removeClass('down');
			$(this).addClass('up');
			$(this).siblings('.select-dropdown').show();
		} else {
			$(this).removeClass('up');
			$(this).addClass('down');
			$(this).siblings('.select-dropdown').hide();
		}
	});
	lQuery('.select-dropdown li a').livequery(
			"click",
			function() {
				$(this).closest('.select-dropdown').siblings(
						'.select-dropdown-open').removeClass('up');
				$(this).closest('.select-dropdown').siblings(
						'.select-dropdown-open').addClass('down');
				$(this).closest('.select-dropdown').hide();
				console.log("Clicked");
			});

	function select2formatResult(emdata) {
		/*
		 * var element = $(this.element); var showicon =
		 * element.data("showicon"); if( showicon ) { var type =
		 * element.data("searchtype"); var html = "<img
		 * class='autocompleteicon' src='" + themeprefix + "/images/icons/" +
		 * type + ".png'/>" + emdata.name; return html; } else { return
		 * emdata.name; }
		 */
		return emdata.name;
	}
	function select2Selected(selectedoption) {

		// "#list-" + foreignkeyid
		// var id = container.closest(".select2-container").attr("id");
		// id = "list-" + id.substring(5); //remove sid2_
		// container.closest("form").find("#" + id ).val(emdata.id);
		return selectedoption.name || selectedoption.text;
	}

	lQuery(".suggestsearchinput")
			.livequery(
					function() {
						var theinput = $(this);
						if (theinput && theinput.autocomplete) {
							theinput
									.autocomplete({
										source : apphome
												+ '/components/autocomplete/assetsuggestions.txt',
										select : function(event, ui) {
											// set input that's just for display
											// purposes
											theinput.val(ui.item.value);
											$("#search_form").submit();
											return false;
										}
									});
						}
						//console.log(theinput);

						if (theinput.data("quicksearched") == true) {
							var strLength = theinput.val().length * 2;
							theinput.focus();
							theinput[0].setSelectionRange(strLength, strLength);
						}
					});

	lQuery("input.defaulttext").livequery("click", function() {
		var theinput = $(this);
		var startingtext = theinput.data('startingtext');
		if (theinput.val() == startingtext) {
			theinput.val("");
		}
	});

	lQuery("select.listtags")
			.livequery(
					function() {
						var theinput = $(this);
						var dropdownParent = theinput.data('dropdownparent');
						if (dropdownParent && $("#" + dropdownParent).length) {
							dropdownParent = $("#" + dropdownParent);
						}
						else {
							dropdownParent = $(this).parent();
						}
						var parent = theinput.closest("#main-media-container");
						if (parent.length) {
							dropdownParent = parent;
						} 
						var parent = theinput.parents(".modal-content");
						if (parent.length) {
							dropdownParent = parent;
						}
						var searchtype = theinput.data('searchtype');
						var searchfield = theinput.data('searchfield');
						var catalogid = theinput.data('listcatalogid');
						var sortby = theinput.data('sortby');
						var defaulttext = theinput.data('showdefault');
						if (!defaulttext) {
							defaulttext = "Search";
                        }
                        var allowClear = $(this).data('allowclear');
                        if (allowClear == undefined)  {
                            allowClear = true;
                        }
                        
						var url = apphome
								+ "/components/xml/types/autocomplete/tagsearch.txt?catalogid="
								+ catalogid + "&field=" + searchfield
								+ "&operation=contains&searchtype="
								+ searchtype;

						theinput
								.select2(
										{
											tags : true,
											placeholder : defaulttext,
											allowClear : allowClear,
											dropdownParent : dropdownParent,
											selectOnBlur : true,
											delay : 150,
											minimumInputLength : 1,
											ajax : { // instead of writing
														// the function to
														// execute the request
														// we use Select2's
														// convenient helper
												url : url,
												xhrFields: {
											        withCredentials: true
											    },
												crossDomain: true,
												dataType : 'json',
												data : function(params) {
													var search = {
														page_limit : 15,
														page : params.page
													};
													search[searchfield
															+ ".value"] = params.term; // search
																						// term
													search["sortby"] = sortby; // search
																				// term
													return search;
												},
												processResults : function(data,
														params) { // parse the
																	// results
																	// into the
																	// format
																	// expected
																	// by
																	// Select2.
													params.page = params.page || 1;
													return {
														results : data.rows,
														pagination : {
															more : false
														// (params.page * 30) <
														// data.total_count
														}
													};
												}												
											},
											escapeMarkup : function(m) {
												return m;
											},
											templateResult : select2formatResult,
											templateSelection : select2Selected,
											tokenSeparators : [ "|" ],
											separator : '|'
											
										});
							theinput.on("select2:select" , function() {
								if ($(this).parents(".ignore").length == 0) {
									$(this).valid(); 
								}
						   });
						   theinput.on("select2:unselect" , function() {
								if ($(this).parents(".ignore").length == 0) {
									$(this).valid(); 
								}
							});
					});

	lQuery("input.grabfocus").livequery(function() {
		var theinput = $(this);
		//theinput.css("color", "#666");
//		if (theinput.val() == "") {
//			var newval = theinput.data("initialtext");
//			theinput.val(newval);
//		}
//		theinput.click(function() {
//			//theinput.css("color", "#000");
//			var initial = theinput.data("initialtext");
//			console.log(initial, theinput.val());
//			if (theinput.val() === initial) {
//				theinput.val('');
//				theinput.unbind('click');
//			}
//		});
		theinput.focus();
		
		var val = theinput.val();
		theinput.val("");
		theinput.val(val);
		
	});

	lQuery(".emtabs").livequery(
			function() {
				var tabs = $(this);

				var tabcontent = $("#" + tabs.data("targetdiv"));

				// active the right tab
				var hash = window.location.hash;
				if (hash) {
					var activelink = $(hash, tabs);
					if (activelink.length == 0) {
						hash = false;
					}
				}
				if (!hash) {
					hash = "#" + tabs.data("defaulttab");
				}
				var activelink = $(hash, tabs);
				var loadedpanel = $(hash + "panel", tabcontent);
				if (loadedpanel.length == 0) {
					loadedpanel = $("#loadedpanel", tabcontent);
					loadedpanel.attr("id", activelink.attr("id") + "panel");
					activelink.data("tabloaded", true);
				}
				activelink.parent("li").addClass("emtabselected");
				activelink.data("loadpageonce", false);

				$("a:first-child", tabs).on(
						"click",
						function(e) {
							e.preventDefault();

							var link = $(this); // activated tab
							$("li", tabs).removeClass("emtabselected");
							link.parent("li").addClass("emtabselected");

							var id = link.attr("id");

							var url = link.attr("href");
							var panelid = id + "panel";
							var tab = $("#" + panelid);
							if (tab.length == 0) {
								tab = tabcontent
										.append('<div class="tab-pane" id="'
												+ panelid + '" ></div>');
								tab = $("#" + panelid);
							}

							var reloadpage = link.data("loadpageonce");
							var alwaysreloadpage = link
									.data("alwaysreloadpage");
							if (reloadpage || alwaysreloadpage) {
								if (window.location.href.endsWith(url)) {
									window.location.reload();
								} else {
									window.location.href = url;
								}
							} else {
								url = url + "#" + id;
								var loaded = link.data("tabloaded");
								if (link.data("allwaysloadpage")) {
									loaded = false;
								}
								if (!loaded) {
									var levels = link.data("layouts");
									if (!levels) {
										levels = "1";
									}
									$.get(url, {
										oemaxlevel : levels
									}, function(data) {
										tab.html(data);
										link.data("tabloaded", true);
										$(">.tab-pane", tabcontent).hide();
										tab.show();
										$(window).trigger("resize");
									});
								} else {
									$(">.tab-pane", tabcontent).hide();
									tab.show();
									$(window).trigger("resize");
								}
							}
						});
			});

	lQuery(".closetab").livequery('click', function(e) {
		e.preventDefault();
		var tab = $(this);
		var nextpage = tab.data("closetab");
		$.get(nextpage, {
			oemaxlayout : 1
		}, function(data) {
			var prevtab = tab.closest('li').prev();
			prevtab.find('a').click();

			if (prevtab.hasClass('firstab')) {
				tab.closest('li').remove();
			}

		});
		return false;
	});

	lQuery(".collectionclose").livequery('click', function(e) {
		e.preventDefault();
		var collection = $(this);
		var nextpage = collection.data("closecollection");
		$.get(nextpage, {
			oemaxlayout : 1
		}, function(data) {
			collection.closest('li').remove();
		});
		return false;
	});
	
	lQuery(".createmedia-btn").livequery('click', function(e) {
		$(".createmedia-tab").removeClass("createmedia-selected");
		$(this).closest(".createmedia-tab").addClass("createmedia-selected");
	});
	
	

	lQuery("select.listautocomplete").livequery(
			function() // select2
			{
				var theinput = $(this);
				var searchtype = theinput.data('searchtype');
				if (searchtype != undefined) // called twice due to
												// the way it reinserts
												// components
				{
					var searchfield = theinput.data('searchfield');
					var catalogid = theinput.data('listcatalogid');

					var foreignkeyid = theinput.data('foreignkeyid');
					var sortby = theinput.data('sortby');

					var defaulttext = theinput.data('showdefault');
					if (!defaulttext) {
						defaulttext = "Search";
					}
					var defaultvalue = theinput.data('defaultvalue');
					var defaultvalueid = theinput
							.data('defaultvalueid');

					var url = apphome
							+ "/components/xml/types/autocomplete/datasearch.txt?catalogid="
							+ catalogid + "&field=" + searchfield
							+ "&operation=contains&searchtype="
							+ searchtype;
					if (defaultvalue != undefined) {
						url = url + "&defaultvalue=" + defaultvalue
								+ "&defaultvalueid=" + defaultvalueid;
					}
					
					
					var dropdownParent = theinput.data('dropdownparent');
					if (dropdownParent && $("#" + dropdownParent).length) {
						dropdownParent = $("#" + dropdownParent);
					}
					else {
						dropdownParent = $(this).parent();
					}
					var parent = theinput.closest("#main-media-container");
					if (parent.length) {
						dropdownParent = parent;
					} 
					var parent = theinput.parents(".modal-content");
					if (parent.length) {
						dropdownParent = parent;
					}
                   
                    var allowClear = theinput.data('allowclear');
                    if (allowClear == undefined)  {
                        allowClear = true;
                    }
					theinput.select2({
								placeholder : defaulttext,
								allowClear : allowClear,
								minimumInputLength : 0,
								dropdownParent : dropdownParent,
								ajax : { // instead of writing the
											// function to execute the
											// request we use Select2's
											// convenient helper
									url : url,
									dataType : 'json',
									data : function(params) {
										var fkv = theinput.closest(
												"form").find(
												"#list-" + foreignkeyid
														+ "value")
												.val();
										if (fkv == undefined) {
											fkv = theinput
													.closest("form")
													.find(
															"#list-"
																	+ foreignkeyid)
													.val();
										}
										var search = {
											page_limit : 15,
											page : params.page
										};
										search[searchfield + ".value"] = params.term; // search
																						// term
										if (fkv) {
											search["field"] = foreignkeyid; // search
																			// term
											search["operation"] = "matches"; // search
																				// term
											search[foreignkeyid
													+ ".value"] = fkv; // search
																		// term
										}
										if (sortby) {
											search["sortby"] = sortby; // search
																		// term
										}
										return search;
									},
									processResults : function(data,
											params) { // parse the
														// results into
														// the format
														// expected by
														// Select2.
										var rows = data.rows;
										if (theinput
												.hasClass("selectaddnew")) {
											if (params.page == 1
													|| !params.page) {
												var addnewlabel = theinput
														.data('addnewlabel');
												var addnewdata = {
													name : addnewlabel,
													id : "_addnew_"
												};
												rows
													.unshift(addnewdata);
											}
										}
										// addnew
										params.page = params.page || 1;
										return {
											results : rows,
											pagination : {
												more : false
											// (params.page * 30) <
											// data.total_count
											}
										};
									}
								},
								escapeMarkup : function(m) {
									return m;
								},
								templateResult : select2formatResult,
								templateSelection : select2Selected
							});

					// TODO: Remove this?
					theinput.on("change", function(e) {
						if (e.val == "") // Work around for a bug
											// with the select2 code
						{
							var id = "#list-" + theinput.attr("id");
							$(id).val("");
						} else {
							// Check for "_addnew_" show ajax form
							var selectedid = theinput.val();

							if (selectedid == "_addnew_") {
								var clicklink = $("#"
										+ theinput.attr("id") + "add");
								clicklink.trigger("click");

								e.preventDefault();
								theinput.select2("val", "");
								return false;
							}
							if (theinput.hasClass("uifilterpicker")) //Not used? 
							{
								//$entry.getId()${fieldname}_val
								var fieldname = theinput.data("fieldname");
								var targethidden = $("#" + selectedid + fieldname + "_val");
								targethidden.prop("checked",true);
							}
							// Check for "_addnew_" show ajax form
							if (theinput.hasClass("selectautosubmit")) {
								if (selectedid) {
									//var theform = $(this).closest("form");
									var theform =$(this).parent("form")
									if (theform.hasClass("autosubmitform")) {
										theform.trigger("submit");
									}
								}
							}
						}

					});
					
					theinput.on("select2:open", function(e) {
						console.log("open");
						var selectId = $(this).attr("id");
						if(selectId) {
							$(".select2-search__field[aria-controls='select2-" + selectId + "-results']").each(function (key, value) {
							        value.focus()
							})
						}
						else {
							document.querySelector(".select2-container--open .select2-search__field").focus()
						}
					});
				}
	});
	//-
	//List autocomplete multiple and accepting new options
	lQuery("select.listautocompletemulti")
	.livequery(
			function() // select2
			{
				var theinput = $(this);
				var searchtype = theinput.data('searchtype');
				if (searchtype != undefined) 
				{
					var searchfield = theinput.data('searchfield');
					var catalogid = theinput.data('listcatalogid');

					var foreignkeyid = theinput.data('foreignkeyid');
					var sortby = theinput.data('sortby');

					var defaulttext = theinput.data('showdefault');
					if (!defaulttext) {
						defaulttext = "Search";
					}
					var defaultvalue = theinput.data('defaultvalue');
					var defaultvalueid = theinput
							.data('defaultvalueid');

					var url = apphome
							+ "/components/xml/types/autocomplete/datasearch.txt?catalogid="
							+ catalogid + "&field=" + searchfield
							+ "&operation=contains&searchtype="
							+ searchtype;
					if (defaultvalue != undefined) {
						url = url + "&defaultvalue=" + defaultvalue
								+ "&defaultvalueid=" + defaultvalueid;
					}
					
					
					var dropdownParent = theinput.data('dropdownparent');
					if (dropdownParent && $("#" + dropdownParent).length) {
						dropdownParent = $("#" + dropdownParent);
					}
					else {
						dropdownParent = $(this).parent();
					}
					var parent = theinput.closest("#main-media-container");
					if (parent.length) {
						dropdownParent = parent;
					} 
					var parent = theinput.parents(".modal-content");
					if (parent.length) {
						dropdownParent = parent;
					}
                   
                    var allowClear = theinput.data('allowclear');
                    if (allowClear == undefined)  {
                        allowClear = true;
                    }
					theinput
							.select2({
								placeholder : defaulttext,
								allowClear : allowClear,
								minimumInputLength : 0,
								tags:true,
								dropdownParent : dropdownParent,
								ajax : { // instead of writing the
											// function to execute the
											// request we use Select2's
											// convenient helper
									url : url,
									dataType : 'json',
									data : function(params) {
										var fkv = theinput.closest(
												"form").find(
												"#list-" + foreignkeyid
														+ "value")
												.val();
										if (fkv == undefined) {
											fkv = theinput
													.closest("form")
													.find(
															"#list-"
																	+ foreignkeyid)
													.val();
										}
										var search = {
											page_limit : 15,
											page : params.page
										};
										search[searchfield + ".value"] = params.term; // search
																						// term
										if (fkv) {
											search["field"] = foreignkeyid; // search
																			// term
											search["operation"] = "matches"; // search
																				// term
											search[foreignkeyid
													+ ".value"] = fkv; // search
																		// term
										}
										if (sortby) {
											search["sortby"] = sortby; // search
																		// term
										}
										return search;
									},
									processResults : function(data,
											params) { // parse the
														// results into
														// the format
														// expected by
														// Select2.
										var rows = data.rows;
										return {
											results : rows,
											pagination : {
												more : false
											// (params.page * 30) <
											// data.total_count
											}
										};
									}
								},
								escapeMarkup : function(m) {
									return m;
								},
								templateResult : select2formatResult,
								templateSelection : select2Selected
							});

					// TODO: Remove this?
					theinput.on("change", function(e) {
						if (e.val == "") // Work around for a bug
											// with the select2 code
						{
							var id = "#list-" + theinput.attr("id");
							$(id).val("");
						} 
					});
					
					theinput.on("select2:open", function(e) {
						var selectId = $(this).attr("id");
						if(selectId) {
							$(".select2-search__field[aria-controls='select2-" + selectId + "-results']").each(function (key, value) {
							        value.focus()
							})
						}
						else {
							document.querySelector(".select2-container--open .select2-search__field").focus()
						}
					});
			}
	});
	

	
	lQuery(".sidebarsubmenu").livequery("click", function(e) {
		e.stopPropagation();
	});
	
	
	lQuery(".mvpageclick").livequery("click", function(e) {
		e.preventDefault();
		$(".mvpageslist li").removeClass("current");
		$(this).closest("li").addClass("current");
		var pageurl = $(this).data("pageurl");
		$("#mainimage").attr("src", pageurl);
		$(".assetpanel-sidebar").removeClass("assetpanel-sidebar-ontop");
	});
	
	lQuery(".mvshowpages").livequery("click", function(e) {
		$(".assetpanel-sidebar").addClass("assetpanel-sidebar-ontop");
	});
	
	lQuery(".mvshowpages-toggle").livequery("click", function(e) {
		$(".assetpanel-sidebar").removeClass("assetpanel-sidebar-ontop");
		$(".assetpanel-sidebar").addClass("assetpanel-sidebar-hidden");
		$(".assetpanel-content").addClass("assetpanel-content-full");
		$(".mvshowpagestab").css("display","block");
	});
	
	

	lQuery("#mainimageholder").livequery(
			function(e) {
				// Zooming code, only makes sense to run this when we
				// actually have the DOM
				if ($(this).position() == undefined) { // check if the
														// element isn't
														// there (best
														// practice
														// is...?)
					return;
				}
				var clickspot;
				var imageposition;
				var zoom = 30;
				var mainholder = $(this);
				var mainimage = $("#mainimage", mainholder);
				//mainimage.width(mainholder.width());
				$(window)
						.bind(
								'mousewheel DOMMouseScroll',
								function(event) {
									
									var mainimage = $("#mainimage");
									if ($("#hiddenoverlay").css("display") == "none" || !$("#mainimage").length) {
										return true;
									}
									
									event.preventDefault();
									
									if (event.originalEvent.wheelDelta > 0
											|| event.originalEvent.detail < 0) {
										// scroll up
										var w = mainimage.width();
										mainimage.width(w + zoom);
										var left = mainimage.position().left
												- zoom / 2;
										mainimage.css({
											"left" : left + "px"
										});
										return false;
									} else {
										// scroll down
										var w = mainimage.width();
										if (w>100) {
											mainimage.width(w - zoom);
											var left = mainimage.position().left
													+ zoom / 2;
											mainimage.css({
												"left" : left + "px"
											});
										}
										return false;
									}
								}
								);
				
				
				mainimage.on("mousedown", function(event) {
					//console.log($(event.target));
					if ($(event.target).is(".zoomable")) {
						clickspot = event;
						imageposition = mainimage.position();
					}
					return false;
				});

				mainimage.on("mouseup", function(event) {
					clickspot = false;
					var mainimage = $("#mainimage");
					mainimage.removeClass('imagezooming');
					return false;
				});
				
				$(document).on("contextmenu", function(event){
						clickspot = false;
				});

				mainimage.on("mousemove", function(event) {
					// if( isMouseDown() )
					
					if (clickspot) {
						//console.log(clickspot.pageX);
						var changetop = clickspot.pageY - event.pageY;
						var changeleft = clickspot.pageX - event.pageX;

						var left = imageposition.left - changeleft;
						var top = imageposition.top - changetop;
						var mainimage = $("#mainimage");
						mainimage.css({
							"left" : left + "px",
							"top" : top + "px"
						});
						mainimage.addClass('imagezooming');
					}
				});
				
				
				var dist1=0;
				
				mainimage.on('touchstart', function(e) {
					var touch = e.touches[0];
					var div = $(e.target)
					
					
				    if (e.targetTouches.length == 2) {//check if two fingers touched screen
			            dist1 = Math.hypot( //get rough estimate of distance between two fingers
			             e.touches[0].pageX - e.touches[1].pageX,
			             e.touches[0].pageY - e.touches[1].pageY);                  
			        }
				    else {
				    	div.data("touchstartx", touch.pageX);
						div.data("touchstarty", touch.pageY);	
				    }
				});
				
				mainimage.on('touchend', function(e) {
					var touch = e.touches[0];
					var div = $(e.target)
					div.removeData("touchstartx");
					div.removeData("touchstarty");
				});
				
				var touchzoom = 10;
				var zoomed = false;
				var ww = window.innerWidth;
				var wh = window.innerHeight;

				mainimage.on('touchmove', function(e) {
					var div = $(e.target);
					//Zoom!
					 if (e.targetTouches.length == 2 && e.changedTouches.length == 2) {
			             // Check if the two target touches are the same ones that started
			           var dist2 = Math.hypot(//get rough estimate of new distance between fingers
			            e.touches[0].pageX - e.touches[1].pageX,
			            e.touches[0].pageY - e.touches[1].pageY);
			            //alert(dist);
			           var w = mainimage.width();
			           
			            if(dist1>dist2) {
			            	//if fingers are closer now than when they first touched screen, they are pinching
			            	// Zoom out
			            	var neww = w - zoom;
			            	if (neww>50) {
			            		//not smaller than 50px
								var newleft = mainimage.position().left
										+ touchzoom / 2;
								var newright = newleft+mainimage.width();									
								if (newleft<(ww/2) && newright>(ww/2)) {
									mainimage.width(w - touchzoom);
									mainimage.css({
										"left" : left + "px"
									});
								}
								zoomed = true;
			            	}
			            	else {
			            		zoomed = false;
			            	}

			            }
			            else {//if fingers are further apart than when they first touched the screen, they are making the zoomin gesture
			            	// Zoom in
							
							var newleft = mainimage.position().left
									- touchzoom / 2;
							var newright = newleft+mainimage.width();									
							if (newleft<(ww/2) && newright>(ww/2)) {
								mainimage.width(w + touchzoom);
								mainimage.css({
									"left" : newleft + "px"
								});
							}
							zoomed = true;
			            }
					 }
					 else {
						 var touch = e.touches[0];
						 //Move around only when zooming
						 if (zoomed) {
							var left = mainimage.position().left;
							var top = mainimage.position().top;
							var newtop = left;
							
							var startingx = div.data("touchstartx");
							var startingy = div.data("touchstarty");
							var diffx = (touch.pageX - startingx)/30; //?
							var diffy = (touch.pageY - startingy)/30; //?
							
							if (Math.abs(diffx) > Math.abs(diffy)) {
								var change = Math.abs(diffx) / div.width();
								var newleft = left + diffx;
								var newright = newleft+mainimage.width();									
								if (newleft<(ww/2) && newright>(ww/2)) {
									mainimage.css({
										"left" : newleft + "px"
									});
								}
							} else {
								// up/down
								var change = Math.abs(diffy) / div.height();
								newtop = top + diffy;
								mainimage.css({
									"top" : newtop + "px"
								});
							}
						 }
						 
						 /*
						 //Swipe?
						 var touch = e.touches[0];
							var startingx = div.data("touchstartx");
							var startingy = div.data("touchstarty");
							var diffx = touch.pageX - startingx;
							var diffy = touch.pageY - startingy;
							var swipe = false;
							if (Math.abs(diffx) > Math.abs(diffy)) {
								var change = Math.abs(diffx) / div.width();
								if (change > .2) {
									if (diffx > 0) {
										swipe = "swiperight";
									} else {
										swipe = "swipeleft";
									}
								}
							} else {
								// do swipeup and swipedown
								var change = Math.abs(diffy) / div.height();
								if (change > .2) {
									if (diffy > 0) {
										swipe = "swipedown";
									} else {
										swipe = "swipeup";
									}
								}

							}

							if (swipe) {
								//console.log(div);
								var event = {};
								event.originalEvent = e;
								event.preventDefault = function() {
								};
								// TODO: Find out why I can't trigger on $(e.target).trigger it
								// ignores us

								//$("#" + div.attr("id")).trigger(swipe);
							}
							*/
						 }
				});
				
				jQuery(document).ready(function() {
					mainimage.width(mainholder.width());
				});
				

			});
	

	$("video").each(function() {
		$(this).append('controlsList="nodownload"')
		$(this).on('contextmenu', function(e) {
			e.preventDefault();
		});
	});

	lQuery('.dropdown-menu a.dropdown-toggle').livequery(
			'click',
			function(e) {
				if (!$(this).next().hasClass('show')) {
					$(this).parents('.dropdown-menu').first().find('.show')
							.removeClass("show");
				}
				var $subMenu = $(this).next(".dropdown-menu");
				$subMenu.toggleClass('show');

				$(this).parents('li.nav-item.dropdown.show').on(
						'hidden.bs.dropdown', function(e) {
							$('.dropdown-submenu .show').removeClass("show");
						});

				return false;
			});
	lQuery('.dropdown-submenu .dropdown-menu a.dropdown-item').livequery(
			'click', function(e) {
				$(this).parents('.dropdown-menu.show').removeClass("show")
				return false;
			});


	
	
	lQuery('.sidebar-toggler').livequery("click", function(e) {
		e.preventDefault();
		var toggler = $(this);
		var options = toggler.data();
		
		var targetdiv = toggler.data('targetdiv');
		var sidebar = toggler.data('sidebar');
		options["propertyfield"] = "sidebarcomponent";
		options["module"] = $("#applicationcontent").data("moduleid");
		//console.log(data.modulesearchhitssessionid);
		
		if (toggler.data('action') == 'hide') {
			//hide sidebar
			options["sidebarcomponent.value"] = "";
			var url = apphome + '/components/sidebars/index.html';

			jQuery.ajax({
				url: url, 
				async: false, 
				data: options, 
				success: function (data) {
					var cell = findclosest(toggler,"#" + targetdiv); 
					cell.replaceWith(data); //Cant get a valid dom element
		        	$(".pushcontent").removeClass('pushcontent-'+sidebar);
		        	$(".pushcontent").removeClass('pushcontent-open');
					$(".pushcontent").addClass('pushcontent-fullwidth');
					//$(".pushcontent").css("margin-left","");
					$(window).trigger("resize");
				},
				xhrFields: {
	                withCredentials: true
	            },
				crossDomain: true
			});

		}
		else {
			//showsidebar
			options["sidebarcomponent.value"] = sidebar;
			var url  = '';
			if(options["contenturl"] != undefined){
				url = options["contenturl"];
				targetdiv = $("#"+options["targetdiv"])
			}
			else {
				url = apphome + '/components/sidebars/index.html';
				targetdiv = findclosest(toggler, "#" + targetdiv);
			}
			jQuery.ajax({
				url: url, async: false, data: options, success: function (data) {
					targetdiv.replaceWith(data); //Cant get a valid dom element
					$(".pushcontent").removeClass('pushcontent-fullwidth');
					$(".pushcontent").addClass('pushcontent-open');
					//$(".pushcontent").css("margin-left","");
					$(".pushcontent").addClass('pushcontent-'+sidebar);
					var mainsidebar = $(".col-mainsidebar");
					if(mainsidebar.data("sidebarwidth")) {
						var width = mainsidebar.data("sidebarwidth");
						if (typeof width == 'number') {
							$(".pushcontent").css("margin-left", width+"px");
						}
					}
					$(window).trigger("resize");
				},
				xhrFields: {
	                withCredentials: true
	            },
				crossDomain: true
			});
		}
		
	});
	
	lQuery('.col-mainsidebarZ').livequery("mouseenter mouseleave", function(e) {
		
		var toggler = $(this).find(".sidebar-toggler-hide");
		if (toggler) {
			toggler.toggle();
		}
	});
	

	lQuery(".assetpicker .removefieldassetvalue").livequery("click", function(e) 
	{
		e.preventDefault();
		var picker = $(this).closest(".assetpicker");
		var detailid = $(this).data("detailid");
		
		picker.find("#" + detailid + "-preview").html("");
		picker.find("#" + detailid + "-value").val("");
		picker.find("#" + detailid + "-file").val("");		
		
		var theform = $(picker).closest("form");
		theform = $(theform);
		if( theform.hasClass("autosubmit"))
		{
			theform.trigger("submit");
		}
	});
	
	//$('[data-toggle="tooltipb"]').tooltip();
	
	
	//Sidebar Custom Width
	lQuery(".sidebar-toggler-resize").livequery(function()	{
		var slider = $(this);
		var column = $(this).closest(".col-main");
		
		var clickspot;
		var startwidth;
		var width;
		
		slider.on('mouseover', function()	{
			$(this).css('opacity','0.6');
			
			
		});
		slider.on('mouseout', function()	{
			if( !clickspot )
			{
			$(this).css('opacity','0');
			}
			
		});
		slider.on("mousedown", function(event) {
			if (!clickspot) {
				clickspot = event;
				startwidth = column.width();
				return false;
			}
			
		});
		
		//$(".sidebar-toggler-resize").show();
		
		$(window).on("mouseup", function(event)
		{
			
			if( clickspot )
			{
				clickspot = false;
				$(this).css('opacity','0');	
				if (width != "undefined") {
					saveProfileProperty("sidebarwidth",width,function(){
						$(window).trigger("resize");
					});
				}
				return false;
			}
		});
		$(window).on("mousemove", function(event)
		{
			if( clickspot )
			{
				
				$(this).css('opacity','0.6');
				width = 0;
				var changeleft = event.pageX - clickspot.pageX;
				width = startwidth + changeleft;
				width = width+32;
				if( width < 200 )
				{
					width = 200;
				}
				if( width > 380 )  //break sidebarfilter columns
				{
					column.addClass("sidebarwide");
				}
				else {
					column.removeClass("sidebarwide");
				}
				if (width > 500) {
					width = 500;
				}
				column.width(width);
				column.data("sidebarwidth",width);
				$(".pushcontent").css("margin-left",width+"px");
				event.preventDefault();
				$(window).trigger("resize");
				return false;
			}	
		});
	});
	
	
	lQuery(".col-resize").livequery(function()	{
		var slider = $(this);
		var column = $(this).closest(".col-main");
		var content = $(".pushcontent");
		
		var clickspot;
		var startwidth;
		var width;
		
		
		slider.on("mousedown", function(event) {
			if (!clickspot) {
				clickspot = event;
				startwidth = column.width();
				return false;
			}
			
		});
		
		//$(".sidebar-toggler-resize").show();
		
		$(window).on("mouseup", function(event)
		{
			
			if( clickspot )
			{
				clickspot = false;
				if (width != "undefined") {
					saveProfileProperty("sidebarwidth",width,function(){
						$(window).trigger("resize");
					});
				}
				return false;
			}
		});
		$(window).on("mousemove", function(event)
		{
			if( clickspot )
			{
				width = 0;
				var changeleft = event.pageX - clickspot.pageX;
				width = startwidth + changeleft;
				if( width < 200 )
				{
					width = 200;
				}
				if (width > 480) {
					width = 480;
				}
				//console.log("W " , width);
				column.width(width);
				column.data("sidebarwidth",width);
				$(".pushcontent").css("margin-left",width+"px");
				event.preventDefault();
				$(window).trigger("resize");
				return false;
			}	
		});	
	});
	
	lQuery('.sidebarselected').livequery("click",function() {
		$("#sidebar-entities li").removeClass("current");
		$("#sidebar-list-upload").addClass("current");
	});
	
	//Moved From settings.js
	lQuery('#datamanager-workarea th.sortable').livequery("click",function(e) {
	  		var table = $("#main-results-table");
	        var args = {oemaxlevel:1,hitssessionid:table.data("hitssessionid"),origURL:table.data("origURL"),catalogid:table.data("catalogid"),searchtype:table.data("searchtype")};
	        var column = $(this);
	        var fieldid = column.data("fieldid");
	
	        if ( column.hasClass('currentsort') ) 
	        {
	            if ( column.hasClass('up') ) {
					args.sortby=fieldid + 'Down';
	            } else {
	            	args.sortby=fieldid + 'Up';
	            }	         
	        } else {
	            $('#datamanager-workarea th.sortable').removeClass('currentsort');
	           column.addClass('currentsort');
	           column.addClass("up");
	           args.sortby=fieldid + 'Up';
	        }
	        $('#datamanager-workarea').load( apphome + '/views/settings/lists/datamanager/list/columnsort.html',args);
	        e.stopPropagation();
	});
	
	
	lQuery('.tabnav a').livequery("click",function() {
		$('.tabnav a').removeClass('current');
		$(this).addClass('current');
		
	});

	lQuery("select.eventsjump").livequery("change", function () 
       		{
            	var val = $(this).val();
            	var url = $(this).data("eventurl");
            	var targetdiv = $(this).data("targetdiv");
            	
    	        $("#"+targetdiv).load(url + "?oemaxlevel=1&type=" + val, function(){
    	        	$(window).trigger( "resize" );
    	        });
    	        
            });
	lQuery(".permissionsroles").livequery("change", function () {
        var val = $(this).val();
        var targetdiv = $(this).data("targetdiv");
        var url = $(this).data("urlprefix");
        var permissiontype = $(this).data("permissiontype");
        if ( val == "new" ) {
           $("#"+targetdiv).load(url+"addnew.html?oemaxlevel=1&groupname=New", function(){
         	  $(window).trigger( "resize" );
           });
           $("#module-picker").hide();
           
        }
        else {
           $("#"+targetdiv).load(url+"index.html?oemaxlevel=1&permissiontype="+permissiontype+"&settingsgroupid=" + val, function(){
         	  $(window).trigger( "resize" );
           });
           $("#module-picker").show();
           
        }
     });
	
	lQuery(".permission-radio").livequery("click", function () {
		var val = jQuery(this).val();
		
		if(val == "partial"){
			jQuery(this).parent().find(".sub-list").show();
		}
		else {
			jQuery(this).parent().find(".sub-list").hide();
		}
	});
	
	lQuery("#module-picker select").livequery("change", function () {
        var rolesval = $('.permissionsroles').val();
        var val = $(this).val();
        if ( val == "all" ) {
        	jQuery(".togglesection").show();
        }
        else {
     	   jQuery(".togglesection").hide();
     	   jQuery("."+ val).show();
        }
     });

	
	function replaceAll(str, find, replace) {
		find = escapeRegExp(find);
	    return str.replace(new RegExp(find, 'g'), replace);
	}
	
	function escapeRegExp(str) {
	    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}
	
	lQuery('#setup-view').livequery("click", function(){
        if ( $('#setup-view').hasClass('open') ) {
            $('#views-header').height(44)
            $('#views-settings').hide();
            $('#setup-view').removeClass('open');
        }
        else {
            $('#views-header').height('auto')
            $('#views-settings').show();
            $('#setup-view').addClass('open'); 
        }
    });
    
    $('#renderastable').click(function(){
        if ( $('#renderastable').is(':checked') ) {
            $('#rendertableoptions').show();
        }
        else {
            $('#rendertableoptions').hide();
        }
    });
		
	lQuery('.sortviews').livequery(function()
		{
		var sortable = $(this);
		var path = sortable.data("path");
		if (typeof sortable.sortable == "function") {
			sortable.sortable({
				axis: 'y',
				cancel: ".no-sort",
			    update: function (event, ui) 
			    {
					//debugger;
			        var data = sortable.sortable('serialize');
			        data = replaceAll(data,"viewid[]=","|");
			        data = replaceAll(data,"&","");
			        data = data.replace("|","");
			        var args = {};
			        args.items = data;
			        args.viewpath = sortable.data("viewpath");
			        args.searchtype = sortable.data("searchtype");
			        args.assettype = sortable.data("assettype");
			        args.viewid = sortable.data("viewid");
			        $.ajax({
			            data: args,
			            type: 'POST',
			            url: path 		            
			        });
			    },
		        stop: function (event, ui) 
		        {
		            //db id of the item sorted
		            //alert(ui.item.attr('plid'));
		            //db id of the item next to which the dragged item was dropped
		            //alert(ui.item.prev().attr('plid'));
		        }
		     });   
		}
	});
	
	
	lQuery('.listsort').livequery(function() {
	var listtosort = $(this);
	if (typeof listtosort.sortable == "function") {
		listtosort.sortable({
				axis: 'y',
				cancel: ".no-sort",
			    stop: function (event, ui) {
			  
					var path = $(this).data("path");
			    	
			        var data = "";
	
			       // var ids = new Array();
			        $(this).find('li').each(function(index) 
			        {
			        	if( !$(this).hasClass("no-sort"))
			        	{
			        		var id = $(this).attr("id");
			        		data = data + "ids=" + id + "&";
			        	}
					});
			        // POST to server using $.post or $.ajax
			        $.ajax({
			        	data: data,
			            type: 'POST',
			            url: path 		            
			        });
			    }
		});
	}
	});
		
		
	lQuery( ".copytoclipboard" ).livequery("click", function(e) {
		  e.preventDefault();
		  e.stopPropagation();
		  var btn = $(this);
		  var copytextcontainer = btn.data("copytext");
		  var copyText = $("#"+copytextcontainer);
	      copyText.select();
		  document.execCommand("copy");
		  var alertdiv = btn.data("targetdiv");
		  if (alertdiv) {
			  console.log(copyText);
			  $("#"+alertdiv).show().fadeOut(2000);
		  }
		  
	});
	
	
	lQuery( ".favclick" ).livequery("click", function(e) {
		e.preventDefault();
		var item = $(this);
		var itemid = item.data("id");
		var searchtype = item.data("searchtype");
		var favurl= item.data("favurl");
		var targetdiv= item.data("targetdiv");
		var options = item.data();
		if (itemid) {
			if (item.hasClass("itemfavorited")){
				jQuery.ajax(
						{
							url:  apphome + "/components/userprofile/favoritesremove.html?profilepreference=" + "favorites_"+searchtype + "&profilepreference.value=" + itemid,
							success: function() {
								//item.removeClass("ibmfavorited");
								jQuery.get(favurl, options, function(data) 
										{
											$("."+targetdiv).replaceWith(data);
										});
								}
						}
					);
			}else {
				jQuery.ajax(
					{
							url:  apphome + "/components/userprofile/favoritesadd.html?profilepreference=" + "favorites_"+searchtype + "&profilepreference.value=" + itemid,
							success: function(){
								//item.addClass("ibmfavorited");
								jQuery.get(favurl, options, function(data) 
										{
											$("."+targetdiv).replaceWith(data);
										});
								}
					});
			}
		}
	});
	
	
	lQuery( ".emdesktopdownload" ).livequery("click", function(e) {
		e.preventDefault();
		var item = $(this);
		var reload = item.data("reloadsidebar");
		if( reload == undefined)
		{
			reload = true;
		}
		var options = item.data();
		jQuery.ajax(
				{
					url:  apphome + "/components/sidebars/userdownloads/start.html",
					data: options,
					success: function() {
						//Refresh side panel
						if( reload )
						{
							var nextpage = apphome + "/components/sidebars/index.html";
							jQuery.ajax({
								url: nextpage, 
								data: options, 
								success: function (data) {
									$("#col-sidebars").replaceWith(data); //Cant get a valid dom element
									$(window).trigger( "resize" );
								}
							});
						}
					}
				}
			);
	});
	
	lQuery( ".emdesktopopen" ).livequery("click", function(e) {
		e.preventDefault();
		var item = $(this);
		var options = item.data();
		jQuery.ajax(
				{
					url:  apphome + "/components/sidebars/userdownloads/open.html",
					data: options,
					success: function() {
						//Refresh side panel
						var nextpage = apphome + "/components/sidebars/index.html";
						jQuery.ajax({
							url: nextpage, 
							data: options, 
							success: function (data) {
								$("#col-sidebars").replaceWith(data); //Cant get a valid dom element
								$(window).trigger( "resize" );
							}
						});
					}
				}
			);
	});
	
	
	lQuery(".seemorelink").livequery("click", function(e){
		e.preventDefault();
		var textbox = $(this).data("seemore");
		if (textbox) {
			$("#"+textbox).removeClass("seemoreclosed");
			$(this).hide();
		}
		
	});
	
	
	lQuery("#collectionresultsdialog .rowclick").livequery("click", function(e) {
		var launcher = jQuery("#search-collections-dialog").data("searchcollectinolauncher");
		if (launcher != "") {
			launcher = $("#"+launcher);
			if (launcher.length) {
				var nextpage = launcher.data("targeturl");
				var targetdiv = launcher.data("targetdiv");
				if (nextpage && targetdiv) {
					closeemdialog($(this).closest(".modal"));
					var rowid = $(this).attr("rowid");
					var options = launcher.data();
					options.collectionid = rowid;
					console.log(options);
					jQuery.ajax({
						url: nextpage, 
						data: options, 
						success: function (data) {
							$("#"+targetdiv).html(data);
							$(window).trigger( "resize" );
						}
					});
				}
			}
		}
	});
	
	lQuery("#assetcollectionresultsdialog .rowclick").livequery("click", function(e) {
		closeemdialog($(this).closest(".modal"));
		var rowid = $(this).attr("rowid");
		$("#submitcollectionid").val(rowid);
		$("#colelectform").trigger("submit");

	});
	
	lQuery( ".copyembed" ).livequery("click", function(e) {
		e.preventDefault();
        var embedbtn = $(this);
		  var loaddiv = embedbtn.data("targetdivinner");
		  var nextpage = embedbtn.attr("href")
		  jQuery.get(nextpage, function(data) {
					$("#"+loaddiv).html(data);
					var copyText = $("#"+loaddiv).children("textarea");
			        if ((typeof copyText) != "undefined") {
						  copyText.select();
						  document.execCommand("copy");
					}	
					$(window).trigger( "resize" ); //need this?
				})		
		  
		  
		  
	});
	
	
	lQuery( ".toggle-upload-details" ).livequery("click", function(e) {
		toggleuploaddetails($(this));
	});
	
	toggleuploaddetails = function(detail, status = '') {
		if (status=='') {
			status = detail.data("status");
		}	
		if (status=="open") {
			detail.next(".toggle-content").hide();
			detail.children(".fas").removeClass("fa-caret-down").addClass("fa-caret-right");
			detail.data("status", "closed");
		}
		else {
			detail.next(".toggle-content").show();
			detail.children(".fas").removeClass("fa-caret-right").addClass("fa-caret-down");
			detail.data("status", "open");
		}
	};
	
	/*
	lQuery(".tabletypesubentity .rowclick").livequery("click", function(e) {
		e.preventDefault();
		//closeemdialog($(this).closest(".modal"));
		
		//debugger;
		var picker = $(this).closest("#resultsdiv");
		var row = $(this);
		var rowid = row.attr("rowid");
		
		var targetdiv = picker.data("subentitytargetdiv");
		var nextpage = picker.data('subentityclickurl');
		//var options = [];
		var options = picker.data();
		options["searchtype"] = picker.data('searchtype');
		options["id"] = rowid;
		options["oemaxlevel"] = picker.data('subentityoemaxlevel');
		
		//options.submoduleid = rowid;
		
		jQuery.ajax({
			url: nextpage, 
			data: options, 
			success: function (data) {
				$("#"+targetdiv).html(data);
				//console.log("reloading "+targetdiv)
				//$(window).trigger( "resize" );
			}
		});
	
	});
	
*/



}// uiload


showajaxstatus = function(uid)
{
	//for each asset on the page reload it's status
	//console.log(uid);
	var cell = $("#" + uid);
	if( cell )
	{
		var path = cell.attr("ajaxpath");
		if(!path || path =="")
		{
			path = cell.data("ajaxpath");
		}
		//console.log("Loading " + path );
		if( path && path.length > 1)
		{
			var entermediakey = '';
			if (app && app.data('entermediakey') != null) {
				entermediakey = app.data('entermediakey');
			}
			//TODO: entermedia key or serialize
			jQuery.ajax({
				url: path, async: false, data: {}, success: function (data) {
					cell.replaceWith(data);
				},
				xhrFields: {
	                withCredentials: true
	            },
				crossDomain: true
			});
		}	
	}
}


var resizecolumns = function() {
	//make them same top
	var sidebarsposition = $("#resultsdiv").position();
	var sidebarstop = 0;
	/*if (typeof sidebarsposition != "undefined") {
		sidebarstop = sidebarsposition.top;
		$('.col-filters').css('top',sidebarstop + 'px');
		$('.col-left').css('top',sidebarstop + 'px');
	}*/
	
	var header_height = $("#header").outerHeight()
	var footer_height = $("#footer").outerHeight();
	var resultsheader_height = 0;
	
	
	if($(".collection-header").outerHeight()) {
		resultsheader_height = $(".collection-header").outerHeight();
	}
	else if ($(".filtered").outerHeight()) {
		resultsheader_height = $(".filtered").outerHeight();
	}
	
	//var columnsheight = $("body").outerHeight() - allheights;
	var columnsheight = 0;
	var sidebartop = 1;

	
	var coltogglers = $(".col-sidebar-togglers > .col-main-inner");
	if (coltogglers.length) {
		columnsheight = coltogglers.outerHeight();
	}
	var colsidebar = $(".col-mainsidebar").find(".col-main-inner");
	if (colsidebar.length) {
		var thisheight = colsidebar.outerHeight();
		if (thisheight>columnsheight) {
			columnsheight = thisheight;
		}
	}
	
	//reset some heights
	if($(".settingslayout").length) {
		$(".settingslayout").css("height","auto");
	}
	
	var colmaincontet = $(".col-content-main").find(".col-main-inner");
	if (colmaincontet.length) {
		var thisheight = colmaincontet.outerHeight();
		if (thisheight>columnsheight) {
			columnsheight = thisheight;
		}
	}
	
	var allheights  = header_height + resultsheader_height;
	$(".col-sidebar-togglers").css("height", columnsheight + allheights);

	if(!$(".col-mainsidebar").hasClass("fixedheight")) {
		$(".col-mainsidebar").css("height", columnsheight + allheights);
	}
	else {
		allheights  = header_height + resultsheader_height;
		var windowh = $(window).height();
		windowh = windowh - allheights;
		$(".col-left").css("height", columnsheight);
		$(".col-left > .col-main-inner").css("height", windowh);
	}
	
	//$(".col-sidebar").css("min-height", columnsheight);
	if ($(".col-content-main").find(".settingslayout").length) {
		$(".col-content-main").css("height", columnsheight + sidebarstop + "px");
		$(".settingslayout").css("height", columnsheight + sidebarstop + "px");
	}
	else {
		$(".col-content-main").css("height", columnsheight + allheights - header_height);
	}
	
	//$(".pushcontent").css("height","calc(100% - " + resultsheader_height + "px)");
}


var resizesearchcategories = function() {
	var container = $("#sidecategoryresults");
	if (!container) {
		return
	}
	var w = container.width();
	var h = container.height();
	
	var ctree = container.find(".searchcategories-tree");
	var cfilter = container.find(".searchcategories-filter");
	if (w>640) {
		ctree.addClass("widesidebar");
		cfilter.addClass("widesidebar")
		//var wt = ctree.width();
		//cfilter.width(w-wt-12);
		//cfilter.height(h);
		//ctree.height(h);
	}
	else {
		ctree.removeClass("widesidebar");
		cfilter.removeClass("widesidebar");
		//cfilter.width(w-12);
		//ctree.height('250');
		//cfilter.height(h-300);
	}
	//console.log(h);
}


var ranajaxon = new Array();

lQuery(".ajaxstatus").livequery(
	function()
	{
		var uid = $(this).attr("id");
		var isrunning = $(this).data("ajaxrunning");
		var timeout = $(this).data("reloadspeed");
		if( timeout == undefined)
		{
			timeout = 2000;
		}
		var ranonce = ranajaxon[uid];
		if( ranonce == undefined)
		{
			timeout = 500; //Make the first run a quick one
			ranajaxon[uid] = true;
		}
		
		setTimeout('showajaxstatus("' + uid +'");',timeout); //First one is always faster			
	}
);


var resizegallery = function() {
	var container = $("#emslidesheet");
	if (container.length) {
		var containerw = container.width();
		var boxes = Math.floor(containerw/230);
		var boxw = Math.floor(containerw/boxes)-12;
		$("#emslidesheet .emthumbbox").width(boxw);
		
	}
}

adjustdatamanagertable = function() {
	if($(".datamanagertable").length) {
		var height = $( window ).height();
		$(".datamanagertable").height(height - 320);
	}
}


jQuery(document).ready(function() {
	uiload();
	jQuery(window).trigger("resize");
	/*gridResize();
	resizegallery();
	resizecolumns();
	resizesearchcategories();*/
});

jQuery(window).on('resize',function(){
	//console.log("resizing...");
	gridResize();
	resizegallery();
	adjustdatamanagertable();
	resizesearchcategories();
	resizecolumns();
	
	
});


jQuery(document).on('domchanged',function(){
	gridResize(); //This calls checkScroll. Makes sure this is last after any actions
	resizecolumns();
	//jQuery(window).trigger("resize");
});


jQuery(document).on('emtreeselect',function(event){
			var selectednode = event.nodeid;
			$("#parentfilter").val(selectednode);

			$("#autosubmitfilter").ajaxSubmit({
				target:"#categoryresults"
			});
			return false;
});

jQuery(window).on('ajaxsocketautoreload',function(){
	
	 $(".ajaxsocketautoreload").each(function() 
	 {
		 var cell = $(this);
		 var path = cell.data("ajaxpath");
		jQuery.ajax({
			url: path, async: false, data: {}, success: function (data) {
				cell.replaceWith(data);
			},
			xhrFields: {
	            withCredentials: true
	        },
			crossDomain: true
		});
		
	});

});


