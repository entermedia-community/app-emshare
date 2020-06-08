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
	Collection hits = archive.query("librarycollectionusers").exact("collectionid",collectionid).exact("followeruser",userid).search();
	//log.info(collectionid  + " and " + userid + " = " + subscription);
	boolean deleteextra = false;
	for(Data subscription in hits)
	{
		if( deleteextra )
		{
			archive.getSearcher("librarycollectionusers").delete(subscription,null);
		}
		else
		{
			Boolean onteam = subscription.getBoolean("ontheteam")
			onteam = !onteam;
			subscription.setValue("ontheteam",onteam);
			subscription.setValue("addeddate",new Date());
			archive.saveData("librarycollectionusers",subscription);
			
			context.putPageValue("subscription",subscription);
			deleteextra = true;
		}	
	}
	//context.redirect("/"+$applicationid+"/collective/channel/");
		
}

init();


