jQuery(document).ready(function () {
	var app = $("#application");
	var siteroot = app.data("siteroot");
	var mediadb = app.data("mediadbappid");
	var apphome = app.data("apphome");
	var downloadInProgress = {};
	const { ipcRenderer } = require("electron");

	var entermediakey = "";
	if (app && app.data("entermediakey") != null) {
		entermediakey = app.data("entermediakey");
	}

	var headers = { "X-tokentype": "entermedia", "X-token": entermediakey };

	ipcRenderer.send("setConnectionOptions", {
		headers: headers,
		key: entermediakey,
		mediadb:
			window.location.protocol + "//" + window.location.host + "/" + mediadb,
	});

	ipcRenderer.on("set-local-root", (_, localRoot) => {
		app.data("local-root", localRoot);
	});

	ipcRenderer.on("electron-log", (_, ...log) => {
		console.log("Desktop ▼");
		if (Array.isArray(log)) {
			log.forEach((l) => {
				console.log(l);
			});
		} else {
			console.log(log);
		}
	});

	ipcRenderer.on("electron-error", (_, ...error) => {
		console.log("Desktop ▼");
		if (Array.isArray(error)) {
			error.forEach((l) => {
				console.error(l);
			});
		} else {
			console.error(error);
		}
		customToast("Desktop Error: Check log for details.", {
			autohide: false,
			positive: false,
		});
	});

	function humanFileSize(bytes, htm = false) {
		var thresh = 1000;
		if (Math.abs(bytes) < thresh) {
			return bytes + " B";
		}
		var units = ["kB", "MB", "GB", "TB"];
		var u = -1;
		do {
			bytes /= thresh;
			++u;
		} while (Math.round(Math.abs(bytes) * 10) / 10 >= thresh && u < units.length - 1);
		if (htm) return `<b>${bytes.toFixed(1)}</b> ${units[u]}`;
		return bytes.toFixed(1) + units[u];
	}

	ipcRenderer.on("desktopReady", () => {
		lQuery("#relativeLocalRootPath").livequery(function () {
			$(this).val(
				app.data("local-root") +
					$(this).data("modulename") +
					"/" +
					$(this).data("entityname") +
					"/"
			);
		});

		lQuery("#localRootPathInput").livequery(function () {
			$(this).val(app.data("local-root"));
		});

		function checkForPendingDownloads() {
			jQuery.ajax({
				dataType: "json",
				url:
					siteroot +
					"/" +
					mediadb +
					"/services/module/order/downloadorderitems?hitsperpage=10",

				success: function (json) {
					if (json.ordestatus == "complete") return;
					var items = json.orderitems;
					if (items.length == 0) {
						return;
					}
					for (var i = 0; i < items.length; i++) {
						var item = items[i];
						if (
							item.publishstatus.id == "readytopublish" ||
							item.publishstatus.id == "publishingexternal"
						) {
							var file = {
								itemexportname: item.itemexportname,
								itemdownloadurl: item.itemdownloadurl,
							};
							var itemEl = $("#d-" + item.id);
							downloadMediaLocally(item.id, file, itemEl);
						}
					}
				},
			});
		}
		lQuery("#triggerpendingdownloads").livequery(checkForPendingDownloads);

		function showDownloadProgress(orderitemid) {
			$("#dl-" + orderitemid).show();
			$("#dl-" + orderitemid)
				.first()
				.show();
		}
		function hideDownloadProgress(orderitemid) {
			$("#dl-" + orderitemid).hide();
			$("#dl-" + orderitemid)
				.first()
				.hide();
		}
		function errorDownloadProgress(orderitemid) {
			$("#dl-" + orderitemid).css("background-color", "red");
			$("#dl-" + orderitemid)
				.first()
				.hide();
		}
		function successDownloadProgress(orderitemid) {
			$("#dl-" + orderitemid).css("background-color", "green");
			$("#dl-" + orderitemid)
				.first()
				.hide();
		}

		window.onbeforeunload = function () {
			for (var key in downloadInProgress) {
				if (downloadInProgress[key] != null) {
					return "Downloads are in progress. Are you sure you want to leave?";
				}
			}
		};

		function downloadMediaLocally(orderitemid, file, itemEl, retries = 0) {
			if (downloadInProgress[orderitemid]) return;
			if (retries > 3) {
				$.ajax({
					url:
						siteroot +
						"/" +
						mediadb +
						"/services/module/order/updateorderitemstatus?orderitemid=" +
						orderitemid +
						"&publishstatus=canceled",
					success: function () {
						$(window).trigger("autoreload", [$("#userdownloadlist")]);
						showDownloadToast(orderitemid, "error", file.itemexportname);
					},
				});
				return;
			}

			downloadInProgress[orderitemid] = true;

			ipcRenderer.send("start-download", { orderitemid, file, headers });

			ipcRenderer.on(`download-started-${orderitemid}`, () => {
				var downloadStartDate = new Date().toISOString();
				$.ajax({
					url:
						siteroot +
						"/" +
						mediadb +
						"/services/module/order/updateorderitemstatus?orderitemid=" +
						orderitemid +
						"&publishstatus=publishingexternal" +
						"&downloadstartdate=" +
						(downloadStartDate ? downloadStartDate : new Date().toISOString()),
					success: function () {
						showDownloadToast(orderitemid, "downloading", file.itemexportname);
						$(window).trigger("autoreload", [$("#userdownloadlist")]);
						showDownloadProgress(orderitemid);
					},
				});
			});

			ipcRenderer.on(`download-progress-${orderitemid}`, (event, progress) => {
				var percentComplete = Math.floor(
					(progress.loaded / progress.total) * 100
				);
				$("#dl-" + orderitemid).css("width", percentComplete + "%");
				$("#dtt-" + orderitemid).text(percentComplete + "%");
				$("#dlp-" + orderitemid).text(humanFileSize(progress.loaded) + " / ");
				var lastupdated = $("#userdownloadlist").data("lastupdated");
				if (lastupdated === undefined) {
					lastupdated = new Date();
					$("#userdownloadlist").data("lastupdated", lastupdated);
				}
				var diff = new Date().getTime() - lastupdated.getTime();
				if (diff > 5000) {
					$("#userdownloadlist").data("lastupdated", new Date());
					$.ajax({
						url:
							siteroot +
							"/" +
							mediadb +
							"/services/module/order/updateorderitemstatus?orderitemid=" +
							orderitemid +
							"&publishstatus=publishingexternal" +
							"&downloaditemdownloadedfilesize=" +
							progress.loaded,
						success: function () {
							$(window).trigger("autoreload", [$("#userdownloadlist")]);
							$("#dl-" + orderitemid).css("width", percentComplete + "%");
							$("#dlp-" + orderitemid).text(
								humanFileSize(progress.loaded) + " / "
							);
							showDownloadProgress(orderitemid);
						},
					});
				}
			});

			ipcRenderer.on(`download-error-${orderitemid}`, () => {
				errorDownloadProgress(orderitemid);
				downloadInProgress[orderitemid] = null;
				downloadMediaLocally(orderitemid, file, itemEl, retries + 1);
			});

			ipcRenderer.on(`download-abort-${orderitemid}`, () => {
				hideDownloadProgress(orderitemid);
			});

			ipcRenderer.on(`download-finished-${orderitemid}`, (event, filePath) => {
				successDownloadProgress(orderitemid);
				$.ajax({
					url:
						siteroot +
						"/" +
						mediadb +
						"/services/module/order/updateorderitemstatus?orderitemid=" +
						orderitemid +
						"&publishstatus=complete" +
						"&publisheddate=" +
						new Date().toISOString(),
					success: function () {
						downloadInProgress[orderitemid] = null;
						showDownloadToast(orderitemid, "complete", file.itemexportname);
						autoreload($("#userdownloadlist"));
					},
				});
			});
		}

		lQuery(".abortdownloadorder").livequery("click", function (e) {
			// var orderid = $(this).data("orderid");
			var orderitemid = $(this).data("orderitemid");
			if (downloadInProgress[orderitemid]) {
				ipcRenderer.send("cancel-download", { orderitemid });
				downloadInProgress[orderitemid] = null;
			}

			$.ajax({
				url:
					siteroot +
					"/" +
					mediadb +
					"/services/module/order/updateorderitemstatus?orderitemid=" +
					orderitemid +
					"&publishstatus=canceled",
				success: function () {
					autoreload($("#userdownloadlist"));
					var toast = $("#dt-" + orderitemid);
					toast.toast("hide");
				},
			});
		});

		lQuery(".opendownloadedfile").livequery("click", function (e) {
			e.preventDefault();

			var itemexportname = $(this).data("itemexportname");
			var itemdownloadurl = $(this).data("itemdownloadurl");
			var file = {
				itemexportname: itemexportname,
				itemdownloadurl: itemdownloadurl,
			};
			console.log("EM: opening " + file);
			ipcRenderer.send("onOpenFile", file);
		});

		//Read Local
		lQuery(".readlocalpath").livequery("click", function (e) {
			e.preventDefault();
			var path = $(this).data("path");
			//sendReadDirRequest('/home/cristobal/Media/03/05/');

			ipcRenderer.send("readDir", { path });
		});

		function sendReadDirRequest(path) {
			ipcRenderer.send("readDir", {
				path,
				onScan: (fileList) => {
					console.log("Received files from main process:", fileList.files);
					console.log("Received folder from main process:", fileList.folders);
					// Handle the directory listing data here (e.g., display in a UI element)
				},
			});
		}

		var toastTypes = {
			downloading: {
				label: "Downloading",
				icon: "bi bi-download",
				color: "primary",
			},
			complete: {
				label: "Download Complete",
				icon: "bi bi-check-circle-fill",
				color: "success",
			},
			error: {
				label: "Download Error",
				icon: "bi bi-exclamation-triangle",
				color: "danger",
			},
		};
		function getToastTemplate(id, type, filename) {
			var template = "";
			template += '<div role="alert" id="dt-' + id + '" class="toast">';
			template += '<div class="toast-header">';
			template +=
				'<i class="' +
				toastTypes[type].icon +
				" text-" +
				toastTypes[type].color +
				'"></i>';
			template +=
				'<strong class="downloadToastLabel text-' +
				toastTypes[type].color +
				'">' +
				toastTypes[type].label +
				"</strong>";
			// template += '<a class="open">view</a>';
			template +=
				'<button type="button" class="close" data-dismiss="toast">hide</button>';
			template += "</div>";
			template += '<div class="toast-body">';
			var isDesktop = app.data("desktop");
			if (type == "complete" && isDesktop) {
				template +=
					'<a href="#" class="opendownloadedfile" data-itemexportname="' +
					filename +
					'" title="Open File"><i class="bi bi-box-arrow-up-right"></i>&nbsp; ';
			}
			template += '<span class="toast-filename">' + filename + "</span>";
			if (type == "complete" && isDesktop) {
				template += "</a>";
			}
			if (type == "downloading")
				template += '<span class="dprog" id="dtt-' + id + '"></span>';
			template += "</div>";
			template += "</div>";
			return $(template);
		}

		function showDownloadToast(id, type, filename) {
			var check = $("#toastList");
			if (!check.length) {
				var div = $('<div id="toastList"></div>');
				$("body").append(div);
			}
			check = $("#dt-" + id);
			if (check.length) {
				check.remove();
			}

			var div = getToastTemplate(id, type, filename);
			$("#toastList").append(div);
			var toast = $("#dt-" + id);
			toast.toast({ autohide: true, delay: 15000 });
			toast.toast("show");
			toast.on("hidden.bs.toast", function () {
				toast.remove();
			});
		}

		lQuery(".open-file-default").livequery("click", function () {
			var categorypath = $(this).data("categorypath");
			var filename = $(this).data("filename");
			var dlink = $(this).data("dlink");
			var lightbox = $(".upload-lightbox").data("lightbox");
			ipcRenderer.send("openFileWithDefault", {
				categorypath,
				filename,
				dlink,
				lightbox,
			});
		});

		lQuery(".open-folder").livequery("click", function () {
			var path = $(this).data("path") || $(this).data("localpath");
			if (!path) {
				path =
					$(this).parent().data("path") || $(this).parent().data("localpath");
			}
			if (path) {
				ipcRenderer.send("openFolder", { path });
			}
		});

		ipcRenderer.on("extra-folders-found", (_, data) => {
			var tree = "";
			var tab = "";
			data.forEach(({ name, level, index, path, isExtra = false }) => {
				var padding = (level - 1) * 8;
				var isDl = false,
					isUp = false;
				var folder = $("#folder-" + index);
				if (folder.length) {
					isDl = folder.find(".notif").hasClass("dl");
					isUp = folder.find(".notif").hasClass("up");
					tab = folder.find(".pullfetchfolder").data("tab");
				}
				var notifClass = "";
				if (tab === "pull") {
					notifClass = isDl ? "dl" : "";
				} else if (tab === "push") {
					notifClass += isUp || isExtra ? " up" : "";
				}
				console.log({ tab, notifClass });
				tree += `<div style="padding-left: ${padding}px;" class="pull-folder" id="folder-${index}">
				<a href="#"
					class="pullfetchfolder"
					data-tab="${tab}"
					data-categorypath="${path}">
					<i class="bi bi-folder mr-1"></i>
					<span class="mx-1 notif ${notifClass}">${name} <i class="bi bi-circle-fill"></i></span>
					<i class="fas fa-spinner fa-spin text-muted" style="display: none;"></i>
				</a>
			</div>`;
			});
			$("#fetchfolder").html("");
			$(".syncfoldertree").html(tree);
		});

		function fetchFolderFilesList(folder) {
			folder
				.closest(".syncfoldertree")
				.find(".pullfetchfolder")
				.removeClass("current");
			folder.addClass("current");
			var categorypath = folder.data("categorypath");
			var tab = folder.data("tab");
			refreshSync(categorypath, tab);
		}

		lQuery(".pullfetchfolder").livequery("click", function (e) {
			e.preventDefault();
			fetchFolderFilesList($(this));
		});

		function refreshSync(categorypath, tab) {
			ipcRenderer.send("fetchFiles", {
				categorypath: categorypath,
				tab: tab,
			});
		}

		ipcRenderer.on("files-fetched", (_, data) => {
			var tab = data["tab"] === "push" ? "import" : "export";
			$.ajax({
				type: "POST",
				url: apphome + "/components/desktop/" + tab + "/folder.html",
				data: JSON.stringify(data),
				contentType: "application/json",
				//dataType: "json",
				success: function (res) {
					$("#fetchfolder").html(res);
				},
				//handle error
				error: function (xhr, status, error) {
					console.log("error", xhr, status, error);
				},
			});
		});

		ipcRenderer.on("scan-progress", (_, option) => {
			var pendingFolders = $(".pending-folders");

			pendingFolders.find(".no-download").hide();

			var totalDownloadSize = pendingFolders.data("totalDownloadSize");
			if (!totalDownloadSize) {
				totalDownloadSize = 0;
			}
			totalDownloadSize += option.downloadSize;
			pendingFolders.data("totalDownloadSize", totalDownloadSize);
			var totalDownloadCount = pendingFolders.data("totalDownloadCount");
			if (!totalDownloadCount) totalDownloadCount = 0;

			totalDownloadCount += option.downloadCount;
			pendingFolders.data("totalDownloadCount", totalDownloadCount);
			pendingFolders
				.find(".dl-progress")
				.data("serverTotal", totalDownloadSize);
			pendingFolders.find(".dl-count").text(totalDownloadCount);
			pendingFolders.find(".dl-size").text(humanFileSize(totalDownloadSize));

			if (option.downloadCount > 0) {
				$("#folder-" + option.index)
					.find(".notif")
					.addClass("dl");
			}

			var totalUploadSize = pendingFolders.data("totalUploadSize");
			if (!totalUploadSize) totalUploadSize = 0;
			totalUploadSize += option.uploadSize;
			pendingFolders.data("totalUploadSize", totalUploadSize);
			var totalUploadCount = pendingFolders.data("totalUploadCount");
			if (!totalUploadCount) totalUploadCount = 0;

			totalUploadCount += option.uploadCount;
			pendingFolders.data("totalUploadCount", totalUploadCount);
			pendingFolders.find(".up-count").text(totalUploadCount);
			pendingFolders.find(".up-size").text(humanFileSize(totalUploadSize));

			if (option.uploadCount > 0) {
				$("#folder-" + option.index)
					.find(".notif")
					.addClass("up");
			}
		});

		let alreadyScanning = false;
		let scanToastId = null;

		lQuery(".scan-changes").livequery("click", function (e) {
			e.preventDefault();
			scanEntityChange();
		});

		ipcRenderer.on("scan-complete", () => {
			var pendingFolders = $(".pending-folders");
			if (pendingFolders.data("totalDownloadCount") == 0) {
				pendingFolders.find(".no-download").show();
			} else {
				pendingFolders.find(".no-download").hide();
				$(".pull-msg").show();
				$(".download-lightbox-all").prop("disabled", false).show();
			}

			if (pendingFolders.data("totalUploadCount") == 0) {
				pendingFolders.find(".no-upload").show();
			} else {
				pendingFolders.find(".no-upload").hide();
				$(".push-msg").show();
				$(".upload-lightbox-all").prop("disabled", false).show();
			}
			setTimeout(() => {
				$(".scan-changes").find("span").text("Refresh");
				$(".scan-changes").prop("disabled", false);
				if (scanToastId) {
					destroyToast($("." + scanToastId));
				}
			}, 100);
			alreadyScanning = false;
		});

		function scanEntityChange() {
			if (alreadyScanning) return;
			alreadyScanning = true;
			$(".notif").removeClass("dl up");
			$(".download-lightbox-all").hide();
			$(".upload-lightbox-all").hide();
			$(".scan-changes").find("span").text("Refreshing...");
			$(".scan-changes").prop("disabled", true);
			var categorypath = $(".scan-changes").data("toplevelcategorypath");
			if (scanToastId) {
				destroyToast($("." + scanToastId));
			}
			scanToastId = "scan-" + Date.now();
			customToast("Scanning for changes...", {
				id: scanToastId,
				autohide: false,
				loading: true,
			});
			ipcRenderer.send("scanAll", categorypath);
			var openedFolder = $(".pullfetchfolder").first();
			fetchFolderFilesList(openedFolder);
		}

		lQuery(".syncfoldertree").livequery(function () {
			scanEntityChange();
		});

		lQuery(".download-lightbox-all").livequery("click", function (e) {
			e.preventDefault();
			var categorypath = $(this).data("toplevelcategorypath");
			$(".watch-entity").data("downloading", true);
			$(this).prop("disabled", true);
			$(this).find("span").text("Downloading...");
			ipcRenderer.send("downloadAll", categorypath);
		});

		lQuery(".upload-lightbox-all").livequery("click", function (e) {
			e.preventDefault();
			var entityId = $(this).data("entityid");
			var categorypath = $(this).data("toplevelcategorypath");
			$(this).prop("disabled", true);
			$(this).find("span").text("Uploading...");
			$(".scan-changes").prop("disabled", true);
			ipcRenderer.send("uploadAll", {
				categorypath: categorypath,
				entityId: entityId,
			});
		});

		ipcRenderer.on("upload-canceled", () => {
			var syncFolders = getCurrentWorkFolders();
			var formData = new FormData();
			syncFolders.forEach((folder) => {
				formData.append("id", folder.id);
			});
			formData.append("desktopimportstatus", "upload-canceled");
			uploadInProgress = false;
			desktopImportStatusUpdater(formData);
		});

		lQuery(".dir-picker").livequery("click", function (e) {
			e.preventDefault();
			window.postMessage({
				type: "dir-picker",
				targetDiv: $(this).data("target"),
				currentPath: $(this).prev().val(),
			});
		});

		ipcRenderer.on("dir-picked", (_, { targetDiv, path }) => {
			$("#" + targetDiv).val(path);
		});

		lQuery("#changeLocalDirve").livequery("click", function (e) {
			e.preventDefault();
			var selectedPath = $("#localRootPathInput").val();
			ipcRenderer.send("changeLocalDrive", {
				selectedPath,
			});
			closeemdialog($(this).closest(".modal"));
		});

		lQuery("#folderAbsPath").livequery("click", function (e) {
			e.preventDefault();
			window.postMessage({
				type: "select-dirs",
				currentPath: $("#folderAbsPath").val(),
			});
		});

		ipcRenderer.on("selected-dirs", (_, folders) => {
			if (folders.length === 0) return;
			var fileCount = folders.reduce((acc, f) => acc + f.stats.totalFiles, 0);
			var size = folders.reduce((acc, f) => acc + f.stats.totalSize, 0);
			$(".fl-stats").html(
				folders.length +
					" folders selected" +
					" &middot; " +
					fileCount +
					" files (<b>" +
					humanFileSize(size) +
					"</b>)"
			);
			var fp = $(".folder-picker");
			fp.find("input").remove();
			folders.forEach((f) => {
				fp.append(`
					<input type="hidden" name="localpath" value="${f.path}">
					<input type="hidden" name="name.value" value="${f.name}">
					<input type="hidden" name="localsubfoldercount" value="${f.stats.totalFolders}">
					<input type="hidden" name="localitemcount" value="${f.stats.totalFiles}">
					<input type="hidden" name="localtotalsize" value="${f.stats.totalSize}">
				`);
			});
			fp.addClass("picked");
			//test
			var test = fp.parent().serializeArray();
			console.log(test);
		});

		lQuery(".deleteAutoFolder").livequery("click", function () {
			if (
				confirm("Are you sure you want to remove this folder from importer?")
			) {
				var delId = $(this).data("id");
				jQuery
					.ajax({
						type: "DELETE",
						url:
							getMediadb() + "/services/module/desktopsyncfolder/data/" + delId,
					})
					.done(function () {
						$("#wf-" + delId).remove();
					});
			}
		});

		function getCurrentWorkFolders() {
			var folders = [];
			$(".work-folder").each(function () {
				var id = $(this).data("id");
				var localPath = $(this).data("localpath");
				var categoryPath = $(this).data("categorypath");
				var entityId = $(this).data("entityid");
				folders.push({
					id,
					syncFolderId: id,
					localPath,
					categoryPath,
					entityId,
				});
			});
			return folders;
		}

		var uploadInProgress = false;
		function desktopImportStatusUpdater(formData, callback = null) {
			jQuery.ajax({
				url:
					apphome +
					"/views/modules/" +
					moduleid +
					"/components/sidebars/localdrives/updatefolderstatus.html",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				"Content-Type": "multipart/form-data",
				success: function (res) {
					$("#syncFolderList").html(res);
					if (callback) callback();
				},
			});
		}

		ipcRenderer.on("scan-folder-completed", (_, ids) => {
			var formData = new FormData();
			ids.forEach((id) => {
				formData.append("id", id);
				var folder = $("#wf-" + id);
				folder.find();
			});
			formData.append("desktopimportstatus", "upload-started");
			desktopImportStatusUpdater(formData, function () {
				ipcRenderer.send("startAutoFoldersUpload");
			});
		});

		function verifyAutoUploads() {
			uploadInProgress = true;

			var syncFolders = getCurrentWorkFolders();
			var formData = new FormData();
			syncFolders.forEach((folder) => {
				formData.append("id", folder.id);
			});
			formData.append("desktopimportstatus", "scan-started");

			desktopImportStatusUpdater(formData, () => {
				ipcRenderer.send("syncAutoFolders", syncFolders);
			});
		}

		lQuery("#syncAutoFolders").livequery("click", function () {
			if (uploadInProgress) return;
			verifyAutoUploads();
		});

		lQuery(".verifynow").livequery(function () {
			if (uploadInProgress) return;
			verifyAutoUploads();
		});

		function updateCounter(size, persist = false) {
			var counter = $(".upload-counter");
			var fileCount = parseInt(counter.data("fileCount"));
			if (isNaN(fileCount)) fileCount = 0;
			var uploadSize = parseInt(counter.data("uploadSize"));
			if (isNaN(uploadSize)) uploadSize = 0;
			uploadSize += size;
			if (persist) {
				fileCount++;
				counter.data("fileCount", fileCount);
				counter.data("uploadSize", uploadSize);
			}
			var readableSize = humanFileSize(uploadSize, true);
			var htm = "";
			if (fileCount > 0) {
				htm += `<b>${fileCount}</b> files `;
			}
			htm += `(${readableSize}) uploaded.`;
			counter.html(htm);
		}

		ipcRenderer.on("upload-progress", (_, loaded) => {
			console.log("upload-progress", loaded);
			updateCounter(loaded);
		});

		ipcRenderer.on("upload-next", (_, { id, size }) => {
			console.log("upload-next", id, size);
			$(".fl").attr("class", "fl fas fa-folder");
			$("#wf-" + id)
				.find(".fl")
				.attr("class", "fl fas fa-spinner fa-spin");
			updateCounter(size, true);
		});

		function lastScandateUpdater(syncFolderId, callback = null) {
			if (!syncFolderId) return;
			jQuery
				.ajax({
					type: "PUT",
					url:
						getMediadb() +
						"/services/module/desktopsyncfolder/data/" +
						syncFolderId,
					data: JSON.stringify({ lastscandate: new Date().toISOString() }),
					dataType: "json",
					contentType: "application/json; charset=utf-8",
				})
				.done(function () {
					if (callback) callback();
				});
		}

		ipcRenderer.on(
			"upload-each-complete",
			(_, [completedSyncFolderId, count = 0]) => {
				var folder = $("#wf-" + completedSyncFolderId);
				folder.addClass("completed");
				if (count > 0) {
					folder.find(".last-scanned").text("Imported files 1 Second ago");
					lastScandateUpdater(completedSyncFolderId);
				}
			}
		);

		ipcRenderer.on("upload-complete", (_, [lasSyncFolderId, count = 0]) => {
			var refreshList = function () {
				var syncFolders = getCurrentWorkFolders();
				var formData = new FormData();
				syncFolders.forEach((folder) => {
					formData.append("id", folder.id);
				});
				formData.append("desktopimportstatus", "upload-completed");
				uploadInProgress = false;
				desktopImportStatusUpdater(formData);
			};
			if (count > 0) {
				lastScandateUpdater(lasSyncFolderId, refreshList);
			} else {
				refreshList();
			}
		});

		ipcRenderer.on("file-added", () => {
			verifyAutoUploads();
		});

		lQuery(".watch-entity").livequery(function () {
			var toplevelcategorypath = $(this).data("toplevelcategorypath");
			var entityid = $(this).data("entityid");
			ipcRenderer.send("watchFolder", {
				id: entityid,
				path: toplevelcategorypath,
			});
		});

		ipcRenderer.on("file-added", (_, catPath) => {
			var watchEntity = $(".watch-entity");
			var isDownloading = watchEntity.data("downloading");
			if (watchEntity.length > 0 && !isDownloading) {
				var path = watchEntity.data("toplevelcategorypath");
				console.log(catPath, path);
				if (catPath === path || catPath === "/" + path) {
					scanEntityChange();
				}
			}
		});
		ipcRenderer.on("file-removed", (_, catPath) => {
			var watchEntity = $(".watch-entity");
			var isDownloading = watchEntity.data("downloading");
			if (watchEntity.length > 0 && !isDownloading) {
				var path = watchEntity.data("toplevelcategorypath");
				if (catPath === path) {
					scanEntityChange();
				}
			}
		});

		lQuery(".lightbox-header-btns").livequery(function () {
			var uploadsourcepath = $(this).data("path");
			var lightbox = $(this).data("lightbox");
			var entityid = $(this).data("entityid");
			var name = $(this).data("name");
			var moduleid = $(this).data("moduleid");
			var desktop = $(this).data("desktop");

			//TODO check if btns should be disabled

			$(this)
				.find(".download-lightbox")
				.click(function () {
					customToast(
						"Download in progress, check Active Cloud Sync panel for status"
					);
					$(this).prop("disabled", true);
					$(this).find("span").text("Downloading...");
					ipcRenderer.send("lightboxDownload", {
						uploadsourcepath,
						lightbox,
						entityid,
						name,
						desktop,
						moduleid,
					});
				});

			$(this)
				.find(".upload-lightbox")
				.click(function () {
					customToast(
						"Upload in progress, check Active Cloud Sync panel for status"
					);
					$(this).prop("disabled", true);
					$(this).find("span").text("Uploading...");
					ipcRenderer.send("lightboxUpload", {
						uploadsourcepath,
						lightbox,
						entityid,
						name,
						desktop,
						moduleid,
					});
				});
		});
	});

	function getMediadb() {
		var elem = app;
		return elem.data("siteroot") + "/" + elem.data("mediadbappid");
	}

	lQuery(".desktopdirectdownload").livequery("click", function (e) {
		e.preventDefault();
		ipcRenderer.send("directDownload", $(this).attr("href"));
	});

	var hostUrl = location.protocol + "//" + location.host;
	var hoverATO;
	var anchorHovering = false;
	lQuery("a").livequery("mouseover", function () {
		if (hoverATO) clearTimeout(hoverATO);
		anchorHovering = true;
		var hoverpreview = $(".hoverpreview");
		if (!hoverpreview.length) {
			$("body").append('<div class="hoverpreview"></div>');
			hoverpreview = $(".hoverpreview");
		}
		var href = $(this).attr("href");
		if (!href || href === "#") {
			hoverpreview.hide();
			return;
		}
		if (href.startsWith("/")) {
			href = hostUrl + href;
		}
		hoverATO = setTimeout(function () {
			if (!anchorHovering) return;
			hoverpreview.text(href).fadeIn(200);
		}, 1500);
	});
	lQuery("a").livequery("mouseout", function () {
		anchorHovering = false;
		$(".hoverpreview").fadeOut(200);
	});
});
