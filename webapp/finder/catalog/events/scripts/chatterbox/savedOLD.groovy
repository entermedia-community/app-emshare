package chatterbox;

import org.entermediadb.asset.MediaArchive
import org.entermediadb.websocket.chat.ChatManager
import org.openedit.Data
import org.openedit.event.WebEvent
import org.openedit.util.ExecutorManager

public void runit()
{
	log.info("Running");
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");
	ExecutorManager exec = (ExecutorManager) mediaArchive.getBean("executorManager");
	exec.execute( new Runnable() {
		public void run()
		{
			MediaArchive archive = context.getPageValue("mediaarchive");
			Data chat = context.getPageValue("data");
			if( chat == null)
			{
				WebEvent event = (WebEvent)context.getPageValue("webevent"); //Used when called by mediaArchive?
				if(event != null)
				{
					chat = event.getValue("data");
				}		
			}	
			if( chat == null)
			{
				return;
			}
			ChatManager manager = (ChatManager) archive.getBean("chatManager");
			String channelid = chat.get("channel");
			String userid = chat.get("user");
			String messageid = chat.getId();
			if( channelid != null)
			{
				manager.updateChatTopicLastModified( channelid, userid, messageid );
			}	
			
			archive.fireDataEvent(context.getUser(),"google", "sendchatnotification", chat);
			//archive.firePathEvent("google/sendchatnotification", context.getUser(), chat);
			
			if( chat.get("messagestatus") == "pendingbroadcast")
			{
				chat.setValue("messagestatus","broadcasted");
				manager.getChatServer().broadcastMessage(archive.getCatalogId(), chat);
			}
		}
	});
	
	
}

runit();


