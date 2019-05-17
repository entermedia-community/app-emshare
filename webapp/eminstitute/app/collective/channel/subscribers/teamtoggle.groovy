package subscribers;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher


public void init()
{

	String collectionid = context.getRequestParameter("collectionid");
	String userid = context.getRequestParameter("userid");
	MediaArchive archive = context.getPageValue("mediaarchive");
	Data subscription = archive.query("librarycollectionusers").exact("collectionid",collectionid).exact("followeruser",userid).searchOne();
	//log.info(collectionid  + " and " + userid + " = " + subscription);
	if(subscription != null)
	{
		Boolean onteam = subscription.getBoolean("ontheteam")
		onteam = !onteam;
		subscription.setValue("ontheteam",onteam);
		archive.saveData("librarycollectionusers",subscription);
		
		context.putPageValue("subscription",subscription);
	}	
	//context.redirect("/"+$applicationid+"/collective/channel/");
		
}

init();


