package subscribers;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.email.WebEmail
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.users.User
import org.openedit.users.authenticate.PasswordGenerator

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");
	
	String collectionid = context.getRequestParameter("collectionid");
	String userid = context.getRequestParameter("userid");
	
	
	
	Data subscription = archive.query("librarycollectionusers").exact("followeruser", userid).exact("collectionid", collectionid).searchOne();
	if (subscription != null)
	{
		subscription.setValue("addeddate",new Date());
		archive.getSearcher("librarycollectionusers").saveData(subscription);
	}
	
	context.putPageValue("subscription",subscription);
}	
init();


