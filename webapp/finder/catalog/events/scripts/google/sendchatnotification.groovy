package google;

import org.entermediadb.asset.MediaArchive
import org.entermediadb.google.GoogleManager
import org.entermediadb.projects.LibraryCollection
import org.openedit.Data
import org.openedit.MultiValued
import org.openedit.event.WebEvent
import org.openedit.users.User
 

public void runit()
{
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");
	GoogleManager manager = (GoogleManager)mediaArchive.getBean("googleManager");
	
	WebEvent event = (WebEvent)context.getPageValue("webevent");
	
	/*
	 * chat.setValue("message", inMap.get("content"));
		String userid = (String)inMap.get("user").toString();
		chat.setValue("user", userid);
		chat.setValue("channel", inMap.get("channel"));
		chat.setValue("channeltype", inMap.get("channeltype"));
	 */
	if( event == null)
	{
		log.info("No event");
		return;
	}
	User aUser = event.getUser();
	
	Data data = (Data)event.getValue("data");
	if( data == null)
	{
		//Pass along the save data
		String chatterid = event.get("dataid");
		data = (MultiValued)mediaArchive.getData("chatterbox", chatterid);
	}
	String message = data.get("message");
		
	String topicid = data.get("channel");
	
	
	MultiValued topicdata = (MultiValued)mediaArchive.getData("collectiveproject", topicid);
	
	if (topicdata == null) {
		log.error("No channel defined in: " + data);
		return;
	}
	//If it ends with messages
	
   		Map extra = new HashMap();
        Data collection = mediaArchive.getCachedData("librarycollection",topicdata.getValue("parentcollectionid"));
	    String subject =  aUser.getScreenName();
        if(collection != null)
        {
            subject = subject + " in " + collection.getName();
		    extra.put("collectionid", collection.getId());
		    extra.put("collectionlabel", collection.getName());
		    extra.put("collectiontype", collection.get("collectiontype")); //3 is direct messsages project
		    extra.put("collectivetopicid", topicdata.getId());
		    extra.put("collectivetopiclabel", topicdata.getName());
        }
		extra.put("notificationtype", "projectchat");
		extra.put("userid", aUser.getId());
		
		manager.notifyTopic(collection.getId(), aUser, subject, message, extra);
}

runit();
