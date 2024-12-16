jQuery(document).ready(function () {
	var siteroot = $("#application").data("siteroot");
	var mediadb = $("#application").data("mediadbappid");
	var downloaded = {};

	function checkForPendingDownloads() {
		$("#triggerpendingdownloads").remove();
		var url = siteroot + "/" + mediadb + "/services/module/order/downloadqueue";
		jQuery.ajax({
			dataType: "json",
			url: url,
			success: function (json) {
				var queue = json.downloadqueue;
				for (var i = 0; i < queue.length; i++) {
					var item = queue[i];
					if (item.orderid) {
						var filename =
							new Date().toString().substring(0, 24).replace(/:/g, "-") +
							".zip";
						var url =
							siteroot +
							"/" +
							mediadb +
							"/services/module/order/zip/" +
							filename +
							"?orderid=" +
							item.orderid;
						downloadDirectly(item.orderid, url, filename, true);
					} else if (item.url) {
						downloadDirectly(item.id, item.url, item.filename);
					}
				}
			},
		});
	}

	lQuery("#triggerpendingdownloads").livequery(function () {
		setTimeout(checkForPendingDownloads, 1000);
	});

	function downloadDirectly(id, url, filename, isZip = false) {
		//console.log({ id, url, filename, isZip });
		if (downloaded[id]) return;
		downloaded[id] = true;

		if (isZip) {
			triggerDownload(id, url, filename);
		} else {
			var completeUrl =
				siteroot +
				"/" +
				mediadb +
				"/services/module/order/updateorderitemstatus?orderitemid=" +
				id +
				"&publishstatus=complete&publisheddate=" +
				new Date().toISOString();

			$.ajax({
				url: encodeURI(completeUrl),
				success: function () {
					console.log(id, url, filename);
					triggerDownload(id, url, filename);
				},
				error: function () {
					downloaded[id] = false;
				},
			});
		}
	}

	function triggerDownload(id, url, filename) {
		var a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		var check = $("#toastList");
		if (!check.length) {
			var div = $('<div id="toastList"></div>');
			$("body").append(div);
		}

		var div = $(
			'<div role="alert" id="dtDirect' +
				id +
				'" class="toast"><div class="toast-header"><i class="bi bi-check-circle-fill text-success"></i><strong class="downloadToastLabel text-success">Download Started</strong><button type="button" class="close" data-dismiss="toast">hide</button></div><div class="toast-body"><span class="toast-filename">' +
				filename +
				"</span></div></div>"
		);

		$("#toastList").append(div);
		var toast = $("#dtDirect" + id);
		toast.toast({ autohide: true, delay: 15000 });
		toast.toast("show");
		toast.on("hidden.bs.toast", function () {
			toast.remove();
		});

		setTimeout(function () {
			autoreload($("#userdownloadlist"));
		}, 1000);
	}

	lQuery(".abortdownloadorder").livequery("click", function (e) {
		var orderid = $(this).data("orderid");
		downloaded[orderid] = true;

		$.ajax({
			url:
				siteroot +
				"/" +
				mediadb +
				"/services/module/order/orderchangestatus?orderstatus=canceled&downloadstatus=canceled&orderid=" +
				orderid,
			success: function () {
				autoreload($("#userdownloadlist"));
			},
		});
	});
});
//   var siteroot = $("#application").data("siteroot");
//   var mediadb = $("#application").data("mediadbappid");
//   var downloadInProgress = {};

//   function humanFileSize(bytes) {
//     var thresh = 1000;
//     if (Math.abs(bytes) < thresh) {
//       return bytes + " B";
//     }
//     var units = ["kB", "MB", "GB", "TB"];
//     var u = -1;
//     do {
//       bytes /= thresh;
//       ++u;
//     } while (Math.round(Math.abs(bytes) * 10) / 10 >= thresh && u < units.length - 1);
//     return bytes.toFixed(1) + units[u];
//   }

//   function abortDownload(orderitemid) {
//     for (var orderid in downloadInProgress) {
//       if (downloadInProgress[orderid][orderitemid]) {
//         downloadInProgress[orderid][orderitemid].abort();
//         downloadInProgress[orderid][orderitemid] = null;
//         $("#dt-" + orderitemid).toast("hide");
//       }
//     }
//   }

//   function checkForPendingDownloads() {
//     var url =
//       siteroot +
//       "/" +
//       mediadb +
//       "/services/module/order/downloadorderitems?hitsperpage=10";
//     jQuery.ajax({
//       dataType: "json",
//       url: url,
//       success: function (json) {
//         var items = json.orderitems;
//         for (var i = 0; i < items.length; i++) {
//           var item = items[i];
//           var orderid = item.orderid.id;
//           var orderitemid = item.id;
//           if (item.orderstatus == "complete") {
//             abortDownload(orderitemid);
//             continue;
//           }
//           if (
//             item.publishstatus.id == "readytopublish" ||
//             item.publishstatus.id == "publishingexternal"
//           ) {
//             var file = {
//               itemexportname: item.itemexportname,
//               itemdownloadurl: item.itemdownloadurl,
//             };
//             downloadMediaLocally(
//               {
//                 orderid: orderid,
//                 orderitemid: orderitemid,
//               },
//               file
//             );
//           }
//         }
//       },
//     });
//   }
//   lQuery("#triggerpendingdownloads").livequery(checkForPendingDownloads);

//   function showDownloadProgress(orderitemid) {
//     $("#dl-" + orderitemid).show();
//     $("#dl-" + orderitemid)
//       .first()
//       .show();
//   }
//   function hideDownloadProgress(orderitemid) {
//     $("#dl-" + orderitemid).hide();
//     $("#dl-" + orderitemid)
//       .first()
//       .hide();
//   }
//   function errorDownloadProgress(orderitemid) {
//     $("#dl-" + orderitemid).css("background-color", "red");
//     $("#dl-" + orderitemid)
//       .first()
//       .hide();
//   }
//   function successDownloadProgress(orderitemid) {
//     $("#dl-" + orderitemid).css("background-color", "green");
//     $("#dl-" + orderitemid)
//       .first()
//       .hide();
//   }

//   window.onbeforeunload = function () {
//     var hasPendingDownloads = false;
//     for (var orderid in downloadInProgress) {
//       for (var orderitemid in downloadInProgress[orderid]) {
//         if (downloadInProgress[orderid][orderitemid] != null) {
//           hasPendingDownloads = true;
//           break;
//         }
//       }
//     }
//     if (hasPendingDownloads) {
//       return "Downloads are in progress. Are you sure you want to leave?";
//     }
//   };

//   function downloadMediaLocally({ orderid, orderitemid }, file, retries = 0) {
//     if (!downloadInProgress[orderid]) {
//       downloadInProgress[orderid] = {};
//     }
//     if (!orderitemid) {
//       return;
//     }

//     if (downloadInProgress[orderid][orderitemid]) return;
//     if (retries > 3) {
//       $.ajax({
//         url:
//           siteroot +
//           "/" +
//           mediadb +
//           "/services/module/order/updateorderitemstatus?orderitemid=" +
//           orderitemid +
//           "&publishstatus=canceled",
//         success: function () {
//           autoreload($("#userdownloadlist"));
//           showDownloadToast(orderitemid, "error", file.itemexportname);
//         },
//       });
//       return;
//     }
//     downloadInProgress[orderid][orderitemid] = new XMLHttpRequest();

//     var request = downloadInProgress[orderid][orderitemid];
//     request.responseType = "blob";
//     request.open("GET", file.itemdownloadurl);
//     request.addEventListener("abort", function () {
//       hideDownloadProgress(orderitemid);
//     });
//     request.addEventListener("error", function () {
//       errorDownloadProgress(orderitemid);
//       downloadInProgress[orderid][orderitemid] = null;
//       downloadMediaLocally({ orderid, orderitemid }, file, retries + 1);
//     });
//     request.addEventListener("progress", function (e) {
//       if (e.lengthComputable) {
//         var percentComplete = Math.floor((e.loaded / e.total) * 100);
//         $("#dl-" + orderitemid).css("width", percentComplete + "%");
//         $("#dtt-" + orderitemid).text(percentComplete + "%");
//         $("#dlp-" + orderitemid).text(humanFileSize(e.loaded) + " / ");

//         var lastupdated = $("#userdownloadlist").data("lastupdated");
//         if (lastupdated === undefined) {
//           lastupdated = new Date();
//           $("#userdownloadlist").data("lastupdated", lastupdated);
//         }
//         var diff = new Date().getTime() - lastupdated.getTime();
//         if (diff > 5000) {
//           $("#userdownloadlist").data("lastupdated", new Date());
//           $.ajax({
//             url:
//               siteroot +
//               "/" +
//               mediadb +
//               "/services/module/order/updateorderitemstatus?orderitemid=" +
//               orderitemid +
//               "&publishstatus=publishingexternal" +
//               "&downloaditemdownloadedfilesize=" +
//               e.loaded,
//             success: function (item) {
//               if (item.order && item.order.orderstatus.id == "complete") {
//                 abortDownload(orderitemid);
//                 autoreload($("#userdownloadlist"));
//                 return;
//               }
//               autoreload($("#userdownloadlist"));
//               $("#dl-" + orderitemid).css("width", percentComplete + "%");
//               // $("#dtt-" + orderitemid).text(percentComplete + "%");
//               $("#dlp-" + orderitemid).text(humanFileSize(e.loaded) + " / ");
//               showDownloadProgress(orderitemid);
//             },
//           });
//         }
//       }
//     });
//     var downloadStartDate;
//     request.addEventListener("loadstart", function () {
//       downloadStartDate = new Date().toISOString();
//       $.ajax({
//         url:
//           siteroot +
//           "/" +
//           mediadb +
//           "/services/module/order/updateorderitemstatus?orderitemid=" +
//           orderitemid +
//           "&publishstatus=publishingexternal" +
//           "&downloadstartdate=" +
//           (downloadStartDate ? downloadStartDate : new Date().toISOString()),
//         success: function (item) {
//           if (item.order && item.order.orderstatus.id == "complete") {
//             abortDownload(orderitemid);
//             autoreload($("#userdownloadlist"));
//             return;
//           }
//           showDownloadToast(orderitemid, "downloading", file.itemexportname);
//           autoreload($("#userdownloadlist"));
//           showDownloadProgress(orderitemid);
//         },
//       });
//     });
//     request.addEventListener("load", function () {
//       var a = document.createElement("a");
//       var url = URL.createObjectURL(request.response);
//       a.href = url;
//       a.download = file.itemexportname;
//       a.click();
//       successDownloadProgress(orderitemid);
//       $.ajax({
//         url:
//           siteroot +
//           "/" +
//           mediadb +
//           "/services/module/order/updateorderitemstatus?orderitemid=" +
//           orderitemid +
//           "&publishstatus=complete" +
//           "&publisheddate=" +
//           new Date().toISOString(),
//         success: function () {
//           downloadInProgress[orderid][orderitemid] = null;
//           showDownloadToast(orderitemid, "complete", file.itemexportname);
//           autoreload($("#userdownloadlist"));
//         },
//       });
//     });
//     request.send();
//   }

// lQuery(".abortdownloadorder").livequery("click", function (e) {
//   var orderid = $(this).data("orderid");
//   for (var orderitemid in downloadInProgress[orderid]) {
//     if (downloadInProgress[orderid][orderitemid]) {
//       downloadInProgress[orderid][orderitemid].abort();
//       downloadInProgress[orderid][orderitemid] = null;
//     }
//     $("#dt-" + orderitemid).toast("hide");
//   }

//   $.ajax({
//     url:
//       siteroot +
//       "/" +
//       mediadb +
//       "/services/module/order/orderchangestatus?orderid=" +
//       orderid +
//       "&orderstatus=complete",
//     success: function () {
//       autoreload($("#userdownloadlist"));
//     },
//   });
// });

//   var toastTypes = {
//     downloading: {
//       label: "Downloading",
//       icon: "bi bi-download",
//       color: "primary",
//     },
//     complete: {
//       label: "Download Complete",
//       icon: "bi bi-check-circle-fill",
//       color: "success",
//     },
//     error: {
//       label: "Download Error",
//       icon: "bi bi-exclamation-triangle",
//       color: "danger",
//     },
//   };
//   function getToastTemplate(id, type, filename) {
//     var template = "";
//     template += '<div role="alert" id="dt-' + id + '" class="toast">';
//     template += '<div class="toast-header">';
//     template +=
//       '<i class="' +
//       toastTypes[type].icon +
//       " text-" +
//       toastTypes[type].color +
//       '"></i>';
//     template +=
//       '<strong class="downloadToastLabel text-' +
//       toastTypes[type].color +
//       '">' +
//       toastTypes[type].label +
//       "</strong>";
//     // template += '<a class="open">view</a>';
//     template +=
//       '<button type="button" class="close" data-dismiss="toast">hide</button>';
//     template += "</div>";
//     template += '<div class="toast-body">';
//     template += '<span class="toast-filename">' + filename + "</span>";
//     if (type == "downloading")
//       template += '<span class="dprog" id="dtt-' + id + '"></span>';
//     template += "</div>";
//     template += "</div>";
//     return $(template);
//   }

//   function showDownloadToast(id, type, filename) {
//     var check = $("#toastList");
//     if (!check.length) {
//       var div = $('<div id="toastList"></div>');
//       $("body").append(div);
//     }
//     check = $("#dt-" + id);
//     if (check.length) {
//       check.remove();
//     }

//     var div = getToastTemplate(id, type, filename);
//     $("#toastList").append(div);
//     var toast = $("#dt-" + id);
//     toast.toast({ autohide: true, delay: 15000 });
//     toast.toast("show");
//     toast.on("hidden.bs.toast", function () {
//       toast.remove();
//     });
//   }

/**
//Not Used?
	lQuery(".emdesktopdownload").livequery("click", function (e) {
		e.preventDefault();
		var item = $(this);
		var reload = item.data("reloadsidebar");
		if (reload == undefined) {
			reload = true;
		}
		var options = item.data();
		jQuery.ajax({
			url: apphome + "/components/sidebars/userdownloads/start.html",
			data: options,
			success: function () {
				//Refresh side panel
				if (reload) {
					var nextpage = apphome + "/components/sidebars/index.html";
					jQuery.ajax({
						url: nextpage,
						data: options,
						success: function (data) {
							$("#col-sidebars").replaceWith(data); //Cant get a valid dom element
							$(window).trigger("resize");
						},
					});
				}
			},
		});
//   });

//Not Used?
	lQuery(".emdesktopopen").livequery("click", function (e) {
		e.preventDefault();
		var item = $(this);
		var options = item.data();
		jQuery.ajax({
			url: apphome + "/components/sidebars/userdownloads/open.html",
			data: options,
			success: function () {
				//Refresh side panel
				var nextpage = apphome + "/components/sidebars/index.html";
				jQuery.ajax({
					url: nextpage,
					data: options,
					success: function (data) {
						$("#col-sidebars").replaceWith(data); //Cant get a valid dom element
						$(window).trigger("resize");
					},
				});
			},
		});
	});
*/
// });
