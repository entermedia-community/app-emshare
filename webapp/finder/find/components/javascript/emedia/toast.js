var toastTO;

$(window).on("showToast", function (_, anchor) {
	if (!anchor || typeof anchor.data != "function") return;
	var uid = Date.now();
	anchor.data("uid", uid);
	var delay = 10;
	var toastMessage = anchor.data("toastmessage");
	if (!toastMessage) delay = 1250;
	var toastSuccess = anchor.data("toastsuccess");
	var toastError = anchor.data("toasterror");
	if (!toastSuccess) {
		toastSuccess = toastMessage ? "Done!" : "Loaded!";
	}
	if (!toastError) {
		toastError = toastMessage ? "Failed!" : "Error processing the request";
	}
	if (!toastMessage) {
		toastMessage = "Loading...";
	}
	var toast = $(
		`<div class="toastContainer" role="alert" data-uid="${uid}">
			<div class="toastLoader"></div>
			<div class="toastMessage" data-success="${toastSuccess}"  data-error="${toastError}">
				${toastMessage}
			</div>
			<div class="toastClose">&times;</div>
		</div>`
	);
	toastTO = setTimeout(function () {
		$(".toastList").append(toast);
	}, delay);

	var selector = "";
	var anchorId = anchor.attr("id");
	if (anchorId) {
		selector = "#" + anchorId;
	}
	var anchorClass = anchor.attr("class");
	if (anchorClass) {
		selector += "." + anchorClass.split(" ").join(".");
	}
	console.log({
		["[data-uid='" + uid + "']"]: { selector, innerText: anchor.text() },
	});
});

lQuery(".toastClose").livequery("click", function () {
	var toast = $(this).closest(".toastContainer");
	toast.addClass("hide");
	setTimeout(function () {
		toast.remove();
	}, 500);
});

customToast = function (message, options = {}) {
	var autohide = options.autohide === undefined ? true : options.autohide;
	var autohideDelay = options.autohideDelay || 3000;
	var positive = options.positive === undefined ? true : options.positive;
	var btnText = options.btnText;
	var btnClass = options.btnClass || "";
	var toast = $(
		`<div class="toastContainer" role="alert">
			<div class="toast${positive ? "Success" : "Error"}"></div>
			<div class="toastMessage">${message}</div>
			${btnText ? `<button class="${btnClass}">${btnText}</button>` : ""}
			<div class="toastClose">&times;</div>
		</div>`
	);
	$(".toastList").append(toast);
	if (autohide) {
		setTimeout(function () {
			toast.addClass("hide");
			setTimeout(function () {
				toast.remove();
			}, 500);
		}, autohideDelay);
	}
};

function destroyToast(toast, success = true) {
	clearTimeout(toastTO);
	if (!toast) return;
	var msg = toast.find(".toastMessage").data(success ? "success" : "error");
	toast
		.find(".toastLoader")
		.replaceWith(
			success
				? '<div class="toastSuccess"></div>'
				: '<div class="toastError"></div>'
		);
	toast.find(".toastMessage").text(msg);
	setTimeout(function () {
		toast.addClass("hide");
		setTimeout(function () {
			toast.remove();
		}, 500);
	}, 2000);
}

$(window).on("successToast", function (_, anchor) {
	var uid = anchor.data("uid");
	//console.log("successfully removing uid:" + uid);
	var toast = $(".toastContainer[data-uid='" + uid + "']");
	destroyToast(toast);
});

$(window).on("errorToast", function (_, anchor) {
	var uid = anchor.data("uid");
	//console.error("unsuccessfully removing uid:" + uid);
	var toast = $(".toastContainer[data-uid='" + uid + "']");
	destroyToast(toast, false);
});
