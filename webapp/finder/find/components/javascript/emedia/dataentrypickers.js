lQuery(".emrowpicker table td").livequery("click", function (e) {
	var clicked = $(this);
	if (!handleclick(clicked,e)) {
		return true;
	}

	var row = clicked.closest("tr");
	var table = clicked.closest("table");
	var form = clicked.closest(".pickedcategoryform");

	var existing = row.hasClass("emrowselected");
	if (!form.hasClass("emmultivalue")) {
		$("tr", table).removeClass("emrowselected");
	}
	row.toggleClass("emrowselected");
	var id = row.data("id");

	$(".emselectedrow", form).each(function () {
		if (form.hasClass("emmultivalue")) {
			var old = $(this).val();
			if (old) {
				if (existing) {
					// removing the value
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

lQuery(".emselectable table td").livequery("click", function (e) {
	var clicked = $(this);
	if (!handleclick(clicked,e)) {
		return true;
	}

	var emselectable = clicked.closest("#emselectable");
	if (emselectable.length < 1) {
		emselectable = clicked.closest(".emselectable");
	}
	var row = clicked.closest("tr");
	var rowid = row.attr("rowid");

	emselectable.find("table tr").each(function (index) {
		clicked.removeClass("emhighlight");
	});
	row.addClass("emhighlight");
	row.removeClass("emborderhover");
	var table = row.closest("table");

	// var url = emselectable.data("clickpath");

	var url = table.data("clickpath");
	var form = emselectable.find("form");
	if (!form.length) {
		form = emselectable.data("emselectableform");
		if (form) {
			form = $("#" + form);
		}
	}
	var data = row.data();

	if (form && form.length > 0) {
		data.id = rowid;
		data.oemaxlevel = form.data("oemaxlevel");
		form.find("#emselectedrow").val(rowid);
		form.find(".emneedselection").each(function () {
			clicked.removeAttr("disabled");
		});
		//form.submit();
		var targetdiv = form.data("targetdiv");
		/*if ((typeof targetdiv) != "undefined") {
					$(form).ajaxSubmit({
						target : "#" + $.escapeSelector(targetdiv), 
						data:data
						
					});
				} else {
					*/
		$(form).trigger("submit");
		//}
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
			link = link + rowid + post;
		} else {
			link = link + rowid;
		}
		if (emselectable.hasClass("showmodal")) {
			showmodal(emselectable, link);
		} else {
			parent.document.location.href = link;
		}
	}
});

//CB Asset picker finish
lQuery(".assetpickerselectrow").livequery("click", function (e) {
	var assetid = $(this).data("assetid");
	jQuery("#" + targetdiv).attr("value", assetid);

	//Todo: Integrte with emselectable
	var emselectable = $(this).closest(".emselectable");

	var launcher = emselectable.data("launcher");
	launcher = $("#" + launcher);
	if (launcher.length) {
		var options = launcher.data();
		options.assetid = assetid;

		var clickurl = launcher.data("clickurl");
		if (clickurl && clickurl != "") {
			var targetdiv = launcher.data("targetdiv");
			if (targetdiv !== undefined) {
				jQuery.ajax({
					url: clickurl,
					data: options,
					success: function (data) {
						if (!targetdiv.jquery) {
							targetdiv = $("#" + targetdiv);
						}
						targetdiv.replaceWith(data);
						closeemdialog(emselectable.closest(".modal"));
					},
				});
			}
			return;
		}
	}
});

//CB This works. Opens entities
lQuery(".topmodules .resultsdivdata").livequery("click", function (e) {
	var row = $(this);
	if (!handleclick(row,e)) {
		return true;
	}

	var clickableresultlist = row.closest(".clickableresultlist");

	var rowid = row.data("dataid");
	clickableresultlist.data("id", rowid);
	clickableresultlist.data("entityid", rowid);
	clickableresultlist.emDialog();
});

lQuery(".listofentities .resultsdivdata").livequery("click", function (e) {
	var row = $(this);
	if (!handleclick(row,e)) {
		return true;
	}

	var clickableresultlist = row.closest(".clickableresultlist");

	var rowid = row.data("dataid");
	var entitymoduleid = row.data("entitymoduleid");
	clickableresultlist.data("url", `${apphome}/views/modules/${entitymoduleid}/editors/default/tabs/index.html`);
	clickableresultlist.data("id", rowid);
	clickableresultlist.data("entityid", rowid);
	clickableresultlist.emDialog();
});



//To open an entity in a submodule. CB Lose Back button
lQuery(".submodulepicker .resultsdivdata").livequery("click", function (e) {
	var row = $(this);
	if (!handleclick(row,e)) {
		return true;
	}

	var submodulepicker = row.closest(".submodulepicker");
	submodulepicker.data("entityid", row.data("dataid"));
	submodulepicker.runAjax();
});
//To open an entity in a submodule. CB Lose Back button
lQuery(".entitysubmodules .resultsdivdata").livequery("click", function (e) {
	var row = $(this);
	if (!handleclick(row,e)) {
		return true;
	}
	var submoduleOpener = row.closest(".clickableresultlist");
	submoduleOpener.data("entityid", row.data("dataid"));
	submoduleOpener.runAjax();
});

//CB working. Uses edithome for searchcategory clicking
lQuery(".listsearchcategories .resultsdivdata").livequery("click", function (e) {
	var row = $(this);
	if (!handleclick(row,e)) {
		return true;
	}
	var submoduleOpener = row.closest(".clickableresultlist");
	submoduleOpener.data("searchcategoryid", row.data("dataid"));
	submoduleOpener.runAjax();
});


//CB working for entity fieldpicking
lQuery(".pickerresults.pickerforfield .resultsdivdata").livequery(
	"click",
	function (e) {
		var clicked = $(this);
		if (!handleclick(clicked,e)) {
			return true;
		}
		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".pickerresults");

		if (pickerresults.length) {
			//Entity Picker Field
			var pickertarget = pickerresults.data("pickertargetfield");
			pickertarget = $("#" + pickertarget);
			if (pickertarget.length > 0) {
				updateentityfield(pickertarget, rowid, row.data("rowname"));
			}
			closeemdialog(pickerresults.closest(".modal"));
		}
	}
);

//CB: assign a asset to a field
lQuery(".pickerresults.pickerpickasset .resultsdivdata").livequery(
	"click",
	function () {
		var clicked = $(this);
		if (!handleclick(clicked,e)) {
			return true;
		}
		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var editdiv = clicked.closest(".editdiv");

		if (editdiv.length) {
			var pickertarget = editdiv.data("pickertargetfield");
			pickertarget = $("#" + pickertarget); //This is the field itself
			if (pickertarget.length > 0) {
				var detailid = pickertarget.data("detailid");
				$("#" + detailid + "-value").attr("value", rowid);
				$("#" + detailid + "-preview").load(
					apphome +
						"/components/xml/types/assetpicker/preview.html?oemaxlevel=1&assetid=" +
						rowid,
					function () {}
				);
			}
			closeemdialog(pickerresults.closest(".modal"));
		}
	}
);

//CB: Is good. for submodules
lQuery(".pickerresults.entitypickersubmodule .resultsdivdata").livequery(
	"click",
	function () {
		var clicked = $(this);
		if (!handleclick(clicked,e)) {
			return true;
		}
		var row = clicked.closest(".resultsdivdata");
		var rowid = row.data("dataid");
		var editdiv = clicked.closest(".editdiv");

		if (editdiv.length) {
			var options = editdiv.cleandata();
			var clickurl = editdiv.data("clickurl");
			options.oemaxlevel = 1;
			options.id = rowid;
			var pickertarget = editdiv.data("targetdiv");
			pickertarget = $("#" + pickertarget);
			if (clickurl !== undefined && clickurl != "") {
				jQuery.ajax({
					url: clickurl,
					data: options,
					success: function (data) {
						var entity = $(".entitydialog");
						autoreload(entity);
						//pickertarget.replaceWith(data);
					},
				});
			}
			closeemdialog(clicked.closest(".modal"));
		}
	}
);

//CB: Good assign a searchcategory to some selected entities
lQuery(".pickerresults.picksearchcategory .resultsdivdata").livequery(
	"click",
	function () {
		var clicked = $(this);
		if (!handleclick(clicked,e)) {
			return true;
		}
		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".pickerresults");
		var clickurl = pickerresults.data("clickurl");
		var options = pickerresults.cleandata();
		options.oemaxlevel = 1;
		options.id = rowid;
		$(window).trigger("showToast", [pickerresults]);
		var toastUid = pickerresults.data("uid");
		jQuery.ajax({
			url: clickurl,
			data: options,
			success: function (data) {
				//show toast or reload page or both
				pickerresults.data("uid", toastUid);
				$(window).trigger("successToast", [pickerresults]);
			},
		});
		closeemdialog(clicked.closest(".modal"));
	}
);

//CB: Good assign assets to a selected entity
lQuery(".pickerresults.pickercopyassetsto .resultsdivdata").livequery(
	"click",
	function () {
		var clicked = $(this);
		if (!handleclick(clicked,e)) {
			return true;
		}
		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".pickerresults");
		var clickurl = pickerresults.data("clickurl");
		var options = pickerresults.cleandata();
		options.oemaxlevel = 1;
		options.id = rowid;
		$(window).trigger("showToast", [pickerresults]);
		var toastUid = pickerresults.data("uid");
		jQuery.ajax({
			url: clickurl,
			data: options,
			success: function (data) {
				//show toast or reload page or both
				pickerresults.data("uid", toastUid);
				$(window).trigger("successToast", [pickerresults]);
			},
		});
		closeemdialog(clicked.closest(".modal"));
	}
);

//Upload to Entity. Still needed?
lQuery(".pickerresults.pickandupload .resultsdivdata").livequery(
	"click",
	function () {
		var clicked = $(this);
		if (!handleclick(clicked,e)) {
			return true;
		}
		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".pickerresults");
		var options = pickerresults.data();
		options.id = rowid;
		if (pickerresults.length) {
			console.log(pickerresults);
			pickerresults.emDialog();
		}
	}
);

//Assets or Categories and you import into a entity
lQuery(".pickerresultscopy .resultsdivdata").livequery("click", function (e) {
	var clicked = $(this);
	if (!handleclick(clicked,e)) {
		return true;
	}
	var row = $(clicked.closest(".resultsdivdata"));
	var rowid = row.data("dataid");
	var pickerresults = clicked.closest(".pickerresults");

	var options = pickerresults.data();
	options.id = rowid;
	var clickurl = pickerresults.data("clickurl");
	var targetdiv = pickerresults.data("clicktargetdiv");
	var targettype = pickerresults.data("targettype");

	if (clickurl !== undefined && clickurl != "") {
		jQuery.ajax({
			url: clickurl,
			data: options,
			success: function (data) {
				if (!targetdiv.jquery) {
					targetdiv = $("#" + targetdiv);
				}
				if (targettype == "message") {
					if (targetdiv !== undefined) {
						targetdiv.prepend(data);
						targetdiv.find(".fader").fadeOut(3000, "linear");
					}
				} else {
					//regular targetdiv
					if (targetdiv !== undefined) {
						targetdiv.replaceWith(data);
					}
				}
				closeemdialog(pickerresults.closest(".modal"));
			},
		});
	}
});

function handleclick(div,e) {
	var clicked = $(e.target);
	
	if (
		clicked.attr("noclick") == "true" ||
		clicked.is("input") ||
		clicked.is("a") ||
		clicked.closest(".jp-audio").length
	) {
		return false;
	}
	e.preventDefault();
	e.stopPropagation();
	return true;
}

//Not used?
$(window).on(  
	"updatepickertarget",
	function (e, pickertargetid, dataid, dataname) {
		var pickertarget = $("#" + pickertargetid);
		if (pickertarget.length > 0) {
			updateentityfield(pickertarget, dataid, dataname);
		}
	}
);

//not used?
updateentityfield = function (pickertarget, id, name) {
	var template = $("#pickedtemplateREPLACEID", pickertarget).html(); //clone().appendTo(pickertarget);
	var newcode = template.replaceAll("REPLACEID", id);
	newcode = newcode.replaceAll("REPLACEFIELDNAME", "");
	var ismulti = pickertarget.data("ismulti");
	if (ismulti == undefined || !ismulti) {
		//clear others
		pickertarget.find("li:not(#pickedtemplateREPLACEID)").remove();
	}
	pickertarget.prepend("<li>" + newcode + "</li>");
	var newrow = pickertarget.find("li:first");
	newrow.attr("id", id);
	newrow.find("a:first").text(name);
	newrow.show();
};

showmodal = function (emselecttable, url) {
	trackKeydown = true;
	var id = "modals";
	var modaldialog = $("#" + id);
	var width = emselecttable.data("dialogwidth");
	if (modaldialog.length == 0) {
		$("#emcontainer").append(
			'<div class="modal " tabindex="-1" id="' +
				id +
				'" style="display:none" ></div>'
		);
		modaldialog = $("#" + id);
	}

	var options = emselecttable.data();
	modaldialog.load(url, options, function () {
		$(".modal-lg").css("min-width", width + "px");
		modaldialog.modal({
			keyboard: true,
			backdrop: true,
			show: true,
		});

		var title = emselecttable.data("dialogtitle");
		if (title) {
			$(".modal-title", modaldialog).text(title);
		}

		$("form", modaldialog).find("*").filter(":input:visible:first").focus();
	});
};
