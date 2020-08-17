//EMfrontend2

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

uiload = function() {
	// https://github.com/select2/select2/issues/600
	//$.fn.select2.defaults.set("theme", "bootstrap4");
	$.fn.modal.Constructor.prototype._enforceFocus = function() {
	}; // Select2 on Modals
	
	resizecolumns()
	
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
                        //Fix Position if in bootstrap modal
						var modal = $("#modals");
                        if (modal) {
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
		theinput.select2({
			allowClear : allowClear,
			dropdownParent : dropdownParent
		});
	});
	

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
				var theform =$(this).parents("form")
				if (theform.hasClass("autosubmitform")) {
					theform.trigger("submit");
				}
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
		targetDiv = targetDiv.replace(/\//g, "\\/");
		$.get(nextpage, {}, function(data) {
			var cell = $("#" + targetDiv);
			cell.replaceWith(data);
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
				if (!targetdiv) {
					targetdiv = form.attr("targetdiv");
				}
				if (targetdiv) {
					targetdiv = targetdiv.replace(/\//g, "\\/");   //TODO use $.escapeSelector ?
				}

				if (form.hasClass("showwaiting")) {
					var app = $("#application");
					var apphome = app.data("home") + app.data("apphome");
					$("#" + targetdiv).html(
							'<img src="' + apphome
									+ '/theme/images/ajax-loader.gif">');
				}
				var oemaxlevel = form.data("oemaxlevel");
				if (!oemaxlevel) {
					oemaxlevel = 1;
				}

				var data;
				if(form.data("includesearchcontext") == true){
					data = jQuery("#resultsdiv").data();
					data.oemaxlevel = oemaxlevel;

				}
				
				else{
					data = {oemaxlevel:oemaxlevel};
				} 
				
				form.ajaxSubmit({
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
								$("#" + $.escapeSelector(targetdiv)).replaceWith(result);
							}
					 	}
		                if (form.hasClass("autocloseform")) {
		                    var findmodal = form.closest(".modal");
		                    if (findmodal && findmodal.modal) {
		                        findmodal.modal("hide");
		                    }
		                }
		        		$('#resultsdiv').data('reloadresults',true);

		                //TODO: Move this to results.js
		                if (form.hasClass("autohideOverlay")) {
		                	hideOverlayDiv(getOverlay());
		                }
						$(window).trigger( "resize" );
		                if (form.hasClass("autoreloadsource")) 
		                {
		                    var link = form.data("openedfrom")
		                    if( link)
		                    {
		                    	window.location.replace(link); 
		                    }
		                }

					},
					data : data
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
		$("input",form).on("keyup", function() {
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

	lQuery("form.ajaxautosubmit").livequery(function() {
		var theform = $(this);
		theform.find("select").change(function() {
			theform.submit();
		});
	});

	lQuery(".submitform").livequery("click", function() {
		var theform = $(this).closest('form');
		theform.submit();
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
			$("body").append(
					'<div class="modal " tabindex="-1" id="' + id
							+ '" style="display:none" ></div>');
			modaldialog = $("#" + id);
		}
		var link = dialog.attr("href");

		var options = dialog.data();
		var param = dialog.data("parameterdata");
		if (param) {
			var element = $("#" + param);
			var name = element.prop("name");
			options[name] = element.val();
		}
		var openfrom = window.location.href;
		
		//openemdialog
		var urlbar = dialog.data("urlbar");
		if( urlbar )
		{
			history.pushState({}, null, urlbar);
		}
		modaldialog.load(link, options, function() {
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
			var modalinstance = modaldialog.modal({
				keyboard : modalkeyboard,
				backdrop : true,
				closeExisting: false,
				"show" : true
			});
				
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
			var title = dialog.attr("title");
			if (title == null) {
				title = dialog.text();
			}
			$(".modal-title", modaldialog).text(title);
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
	
	lQuery(".typeaheaddropdown").livequery(function() {
		
		var input = $(this);
		var hidescrolling = input.data("hidescrolling");

		
		var id = input.data("dialogid");
		if (!id) {
			id = "typeahead";	
		}
		
		var modaldialog = $("#" + id);
		if (modaldialog.length == 0) {
			input.parent().append(
					'<div class="typeaheadmodal " tabindex="-1" id="' + id
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
		var topposition = input.position().top + input.height() + 5;
		modaldialog.css("top", topposition+"px");
		modaldialog.css("left", input.position().left+"px");

		var options = input.data();

		input.on("keyup", function(e) 
		{
			options["description.value"] = input.val();
							
			var url = input.data("typeaheadurl");
			
			if( e.which == 27)
			{
				modaldialog.hide();	
			}
			else if( e.which != 13)
			{
				//Typeahead
				$.ajax(
				{ 
					url: url, async: true, data: options, success: function(data) 
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
						}
						//Search Results
						var url = input.data("searchurl");
						$.ajax({ url: url, async: true, data: options, success: function(data) 
						{
							if(data) 
							{
								$("#searchlayout").html(data);
								if( e.which == 13)
								{
									modaldialog.hide();
								}
							}
						}});
					}
				});
			}
		});
		
		$("body").on("click", function(event){
			
			modaldialog.hide();
		});
	});
	
	

	lQuery('.emrowpicker table td').livequery("click", function(event) {
		event.preventDefault();

		var clicked = $(this);
		var row = clicked.closest("tr");
		var existing = row.hasClass("emrowselected");
		row.toggleClass("emrowselected");
		var id = row.data("id");

		var form = $(clicked.closest("form"));
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

		var targetdiv = form.data("targetdiv");
		if ((typeof targetdiv) != "undefined") {
			$(form).ajaxSubmit({
				target : "#" + $.escapeSelector(targetdiv)
			});
		} else {
			$(form).trigger("submit");
		}
		if (form.hasClass("autoclose")) {
			form.closest(".modal").modal("hide");
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
					form.closest(".modal").modal("hide");
				}
			} else if (url != undefined) {
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
				parent.document.location.href = id;
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
		theinput.css("color", "#666");
		if (theinput.val() == "") {
			var newval = theinput.data("initialtext");
			theinput.val(newval);
		}
		theinput.click(function() {
			theinput.css("color", "#000");
			var initial = theinput.data("initialtext");
			console.log(initial, theinput.val());
			if (theinput.val() === initial) {
				theinput.val('');
				theinput.unbind('click');
			}
		});

		theinput.focus();
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
	
	

	lQuery("select.listautocomplete")
			.livequery(
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
							theinput
									.select2({
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
									// Check for "_addnew_" show ajax form
									if (theinput.hasClass("selectautosubmit")) {
										if (selectedid) {
											//var theform = $(this).closest("form");
											var theform =$(this).parents("form")
											if (theform.hasClass("autosubmitform")) {
												theform.trigger("submit");
											}
										}
									}
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
			}
	});
	

	
	lQuery(".sidebarsubmenu").livequery("click", function(e) {
		e.stopPropagation();
	});
	
	

	lQuery("#mainimageholder")
			.livequery(
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
						mainimage.width(mainholder.width());
						$(window)
								.bind(
										'mousewheel DOMMouseScroll',
										function(event) {
											
											var mainimage = $("#mainimage");
											if ($("#hiddenoverlay").css(
													"display") == "none") {
												return true;
											}

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
										});

						mainimage.on("mousedown", function(event) {
							console.log($(event.target));
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
								console.log(clickspot.pageX);
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

					});

	document.addEventListener('touchstart', function(e) {
		var touch = e.touches[0];
		var div = $(e.target)
		div.data("touchstartx", touch.pageX);
		div.data("touchstarty", touch.pageY);
	});
	document.addEventListener('touchend', function(e) {
		var touch = e.touches[0];
		var div = $(e.target)
		div.removeData("touchstartx");
		div.removeData("touchstarty");
	});

	document.addEventListener('touchmove', function(e) {
		var touch = e.touches[0];
		var div = $(e.target);
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
			console.log(div);
			var event = {};
			event.originalEvent = e;
			event.preventDefault = function() {
			};
			// TODO: Find out why I can't trigger on $(e.target).trigger it
			// ignores us

			$("#" + div.attr("id")).trigger(swipe);
		}

	}, false);

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
		var data = toggler.data();
		
		var targetdiv = toggler.data('targetdiv');
		var sidebar = toggler.data('sidebar');
		data["propertyfield"] = "sidebarcomponent";

		//console.log(data.modulesearchhitssessionid);
		
		if (toggler.data('action') == 'hide') {
			//hide sidebar
			data["sidebarcomponent.value"] = "";
			var url = apphome + '/components/sidebars/index.html';
	        $("#"+targetdiv).load(url,data, function()
		        {
		        	$(".pushcontent").removeClass('pushcontent-'+sidebar);
					$(".pushcontent").addClass('pushcontent-fullwidth');
					$(window).trigger("resize");
		        }
			);
		}
		else {
			//showsidebar
			data["sidebarcomponent.value"] = sidebar;
			var url = apphome + '/components/sidebars/index.html';
	        $("#"+targetdiv).load(url,data, function()
		        {
					$(".pushcontent").removeClass('pushcontent-fullwidth');
					$(".pushcontent").addClass('pushcontent-'+sidebar);
					$(window).trigger("resize");
		        }
			);
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
	
	$('[data-toggle="tooltipb"]').tooltip();
	
	
	//Sidebar Custom Width
	lQuery(".sidebar-toggler-resize").livequery(function()	{
		var slider = $(this);
		var column = $(this).closest(".col-main");
		var content = $(".pushcontent");
		
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
						$(document).trigger("resize");
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
				if( width < 280 )
				{
					width = 280;
				}
				if( width > 380 )  //brake sidebarfilter columns
				{
					column.addClass("sidebarwide");
				}
				else {
					column.removeClass("sidebarwide");
				}
				column.width(width);
				column.data("sidebarwidth",width);
				$(".pushcontent").css("margin-left",width+"px");
				event.preventDefault();
				$(document).trigger("resize");
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
						$(document).trigger("resize");
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
				if( width < 440 )
				{
					width = 440;
				}
				column.width(width);
				column.data("sidebarwidth",width);
				$(".pushcontent").css("margin-left",width+"px");
				event.preventDefault();
				$(document).trigger("resize");
				return false;
			}	
		});	
	});


	//Moved From settings.js
	lQuery('#datamanager-workarea th.sortable').livequery("click",function() {
	  		var table = $("#main-results-table");
	        var args = {oemaxlevel:1,hitssessionid:table.data("hitssessionid"),origURL:table.data("origURL"),catalogid:table.data("catalogid"),searchtype:table.data("searchtype")};
	        var column = $(this);
	        var fieldid = column.data("fieldid");
			var apphome = app.data("home") + app.data("apphome");
	
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
	});
	
	function replaceAll(str, find, replace) {
		find = escapeRegExp(find);
	    return str.replace(new RegExp(find, 'g'), replace);
	}
	
	function escapeRegExp(str) {
	    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}
		
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
		
	var listtosort = $('.listsort');
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
			  console.log(alertdiv);
			  $("#"+alertdiv).show().fadeOut(2000);
		  }
		  
	});
		

}// uiload




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
	
	var allheights  =  header_height +  footer_height + resultsheader_height;
	var columnsheight = $("body").outerHeight() - allheights;
	
	var sidebartop = 1;
	$(".col-main").each(function(){
		var col = $(this);
		if(col.hasClass("col-left") && col.hasClass("fixedheight")) {
				return true;
		}
		var thisheight = col.outerHeight();
		if (col.children(0)	&& col.children(0).hasClass("col-main-inner")) {
			thisheight = col.children(0).outerHeight();
		}
		
		if (thisheight > columnsheight) {
			columnsheight = thisheight;
		}
	});
	$(".col-filters").css("height", columnsheight);
	if(!$(".col-left").hasClass("fixedheight")) {
		$(".col-left").css("height", columnsheight);
	}
	else {
		allheights  = header_height + resultsheader_height;
		var windowh = $(window).height();
		windowh = windowh - allheights;
		$(".col-left").css("height", columnsheight);
		$(".col-left > .col-main-inner").css("height", windowh);
	}
	$(".col-sidebar").css("min-height", columnsheight);
	if ($(".col-content-main").parent().hasClass("settingslayout")) {
		$(".col-content-main").css("min-height", columnsheight + sidebarstop + "px");
	}
	else {
		$(".col-content-main").css("min-height", columnsheight + sidebarstop + "px");
	}
	
	$(".pushcontent").css("height","calc(100% - " + resultsheader_height + "px)");
}


var resizegallery = function() {
	var container = $("#emslidesheet");
	if (container.length) {
		var containerw = container.width();
		var boxes = Math.floor(containerw/230);
		var boxw = Math.floor(containerw/boxes)-12;
		$("#emslidesheet .emthumbbox").width(boxw);
		
	}
}
	


$(document).ready(function() {
	uiload();
	resizecolumns();
	resizegallery();
});

$(window).on('resize',function(){
	resizecolumns();
	resizegallery();
});
