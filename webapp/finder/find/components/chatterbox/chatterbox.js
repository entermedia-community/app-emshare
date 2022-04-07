var chatconnection;
var chatopen = false;

var app = jQuery("#application");
var apphome = app.data("siteroot") + app.data("apphome");

function chatterbox() {	

	reloadAll();

	if(chatopen){
		return;
	}	
	
	connect();
    keepAlive(); // this should be here so it doesn't keep getting requeued.
    

	lQuery(".chatter-send").livequery("click", function(){
		var button = jQuery(this);
		var chatter = button.closest(".chatterbox");
		var data = chatter.data();
	    var content = document.getElementById("chatter-msg").value;
	    data.content = content;
	    data.command= button.data("command");
	    var json = JSON.stringify(data);
	    content.value="";
	    if(chatconnection) {
		    if(chatconnection.readyState === chatconnection.CLOSED  ){
		    	connect();
		    	// IF we do a reconnect render the whole page
		    }
		    var toggle = button.data("toggle");
		    if(toggle == true){
		    	jQuery(".chatter-toggle").toggle();
		    }
		    
		    if(jQuery("#chatter-msg").val() != "" ){
			chatconnection.send(json);
		    jQuery("#chatter-msg").val("");
		    
		    // scroll down, delay a little?
		    scrollToChat();
			
			}
	    }
	});

	lQuery('.chatter-text').livequery("keydown", function(e){
	    if(e.keyCode == 13 && !e.shiftKey)
	    {
	    	// jQuery("#chatter-msg").val("");
	    	e.preventDefault();
			var button = jQuery('button[data-command="messagereceived"]');		    	
	    	button.trigger("click");
	    	return false;
	    } 
	    else
    	{
			var scroll_height = $(this).get(0).scrollHeight;
			if (!$('.chatterbox').hasClass('chatterlongtext') && scroll_height>30) {
				$('.chatterbox').addClass('chatterlongtext');
				scrollToChat();
			}
    	}
	});
	
	lQuery('button[data-command="messagereceived"]').livequery("click", function(e)
	{
		// jQuery("#chatter-msg").val("");
	});

	lQuery(".chatter-save").livequery("click", function(e){
		
		e.preventDefault();
		var button = jQuery(this);
		var form = button.closest(".chatter-edit-form");
		var chatdiv = form.find(".chatter-msg-edit");
		var text = chatdiv.html();
		form.find(".chatter-msg-input").val(text);
		/*
		 * var button = jQuery('submit'); button.trigger("#submit");
		 */
		form.trigger("submit");
		
	});
	
	
	lQuery("a.ajax-edit-msg").livequery('click', function(e) {
		 e.stopPropagation();
	     e.preventDefault();

	     var targetDiv = $(this).data("targetdiv");
	     var options = $(this).data();
	     var nextpage = $(this).attr('href');
	     $.get(nextpage, options, function(data) 
	 			{
	 				var cell = findclosest($(this),"#" + targetDiv); 
	 				cell.replaceWith(data);
	 				scrollToEdit(targetDiv);
	 	 });
	});
	chatopen=true;
}



function scrollToChat()
{
	var inside = $('.chatterbox-body-inside');
	if( inside.length > 0 )
	{
		inside.animate({ scrollTop: inside.get(0).scrollHeight}, 30); 
	}
}

function scrollToEdit(targetDiv)
{
	var messagecontainer = $("#" + targetDiv);
	messagecontainer.get(0).scrollIntoView();
}

function connect() {
    
    var tabID = sessionStorage.tabID && sessionStorage.closedLastTab !== '2' ? sessionStorage.tabID : sessionStorage.tabID = Math.random();
    sessionStorage.closedLastTab = '2';
    $(window).on('unload beforeunload', function() {
          sessionStorage.closedLastTab = '1';
    });

	var app = jQuery("#application");
	var userid = app.data("user");
    var protocol = location.protocol;
    
    var url = "/entermedia/services/websocket/org/entermediadb/websocket/chat/ChatConnection?sessionid=" + tabID + "&userid=" + userid;
    
  // Get the channel
    var channel = jQuery(".chatterbox").data("channel");
    if (channel != null) {
    	url = url + '&channel='+channel;
    }
    
    if (protocol === "https:") {
    	chatconnection = new WebSocket("wss://" +location.host + url );	
    } else{
    	chatconnection = new WebSocket("ws://" +location.host  + url );
    }
    
    
       
    chatconnection.onmessage = function(event) {
    	
    	// var app = jQuery("#application");
    	// var apphome = app.data("home") + app.data("apphome");
    	
    	console.log("The app " + app);
    	
        var message = JSON.parse(event.data);
        //console.log(message);
        
        var channel = message.channel;
        var id = message.messageid;
        message.id = id;
        var existing = jQuery("#chatter-message-" + id);
        if(existing.length){
        	$(existing).find(".chat-msg").html(message.content);
        	
        	return;
        }	
		var chatter = jQuery('div[data-channel="' + channel + '"]');		
		var listarea = chatter.find(".chatterbox-message-list")
		var url = chatter.data("rendermessageurl");
		if( !url)
		{
			url =  apphome + "/components/chatterbox/message.html";
		}	

        scrollToChat();

		jQuery.get( url, message, function( data ) {
			listarea.append( data );
			$(document).trigger("domchanged");
	        scrollToChat();
		});
	
        
        registerServiceWorker();
        
        /*
		 * Check if you are the sender, play sound and notify. "message.topic !=
		 * message.user" checks for private chat
		 */
        var user = app.data("user");
        
        if(message.user != user){
        	
        	play();
        	
        	/* Desktop notifications - mando */
		    function showNotification() 
			{
				const notification = new Notification(message.name + " in " + message.topic, {
					body: message.content,
					renotify: false,
					tag: message.content,
					icon: "https://entermediadb.org/entermediadb/mediadb/services/module/asset/downloads/preset/2019/12/f0/94a/image200x200.png"
				});
				
			}
			
			/* Check para permissions and ask. */ 
			if (Notification.permission === "granted") {
				showNotification();
			} else if (Notification.permission !== "denied") {
				
				createNotificationSubscription();
				
				Notification.requestPermission().then(permission => {
					if (permission === "granted"){
						showNotification();
					}
				});
			}
    	}
    	
        
    }; 

}

/*--------------Begin Functions List--------------*/
function reloadAll(){
	
	jQuery(".chatterbox").each(function () 
	{
		var chatter = $(this);
		var url = chatter.data("renderurl");
		if( !url)
		{
			url =  apphome + "/components/chatterbox/index.html";
		}	
		var chatterdiv = $(this);
		var mydata = $( this ).data();
		jQuery.get( url, mydata, function( data ) {
				chatterdiv.html( data );
				scrollToChat();
		});
					
	});

}



var timerID = 0; 
var wasconnected;

function keepAlive() { 
    var timeout = 20000;  
    if (chatconnection.readyState == chatconnection.OPEN) {  
    	wasconencted = true;
    	var command = new Object();
    	command.command = "keepalive";
    	
    	var userid = jQuery(".chatterbox").data("user"); // TODO: Use app?
    	command.userid =  userid;
    	
    	var chatter = jQuery('.chatterbox').data("channel");
    	command.channel = chatter;
    	
    	var json = JSON.stringify(command);
    	chatconnection.send(json);  
    }
    
    if (chatconnection.readyState === chatconnection.CLOSED) {  
    	connect();
    	reloadAll();
    }
  
    timerId = setTimeout(keepAlive, timeout);  
}  

function cancelKeepAlive() {  
    if (timerId) {  
        clearTimeout(timerId);  
    }  
}

function play(){
	var urls =  apphome + "/components/chatterbox/stairs.wav";
	var snd = new Audio(urls); // buffers automatically when created
	snd.play();
	
	
}


/*-------Start Push and Notification --------*/
const pushServerPublicKey = "BIN2Jc5Vmkmy-S3AUrcMlpKxJpLeVRAfu9WBqUbJ70SJOCWGCGXKY-Xzyh7HDr6KbRDGYHjqZ06OcS3BjD7uAm8";

function registerServiceWorker() {
	  navigator.serviceWorker.register("sw.js")
	}

function initializePushNotifications() {
	  
	  return Notification.requestPermission(function(result) {
	    return result;
	  });
	}
function isPushNotificationSupported() {
	  return "serviceWorker" in navigator && "PushManager" in window;
	}

function createNotificationSubscription() {
	  // wait for service worker installation to be ready, and then
	  return navigator.serviceWorker.ready.then(function(serviceWorker) {
	    // subscribe and return the subscription
	    return serviceWorker.pushManager
	    .subscribe({
	      userVisibleOnly: true,
	      applicationServerKey: pushServerPublicKey
	    })
	    .then(function(subscription) {
	    	// send this to Entermedia backend with a user id
	    	// 'subscription' == PushSubscription (object)
	      console.log("User is subscribed.", subscription);
	      console.log(subscription.endpoint);
	      return subscription;
	    });
	  });
	}





