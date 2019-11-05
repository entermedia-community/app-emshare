package subscribers;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.users.User
import org.openedit.users.authenticate.PasswordGenerator

public void init()
{

	String collectionid = context.getRequestParameter("collectionid");
	String firstName = context.getRequestParameter("firstName");
	String lastName = context.getRequestParameter("lastName");
	String email = context.getRequestParameter("email");
	
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	User teamuser = archive.getUserManager().getUserByEmail(email);
	if( teamuser == null)
	{
		String	password = new PasswordGenerator().generate();
			
		teamuser = archive.getUserManager().createUser(null, password);
		teamuser.setFirstName(firstName);
		teamuser.setLastName(lastName);
		teamuser.setEmail(email);
		archive.getUserManager().saveUser(teamuser);
	}
	
	Data subscription = archive.getSearcher("librarycollectionusers").createNewData();
	
	subscription.setValue("collectionid",collectionid);
	subscription.setValue("followeruser",teamuser.getId());
	subscription.setValue("ontheteam",true);
	subscription.setValue("addeddate",new Date());
	archive.getSearcher("librarycollectionusers").saveData(subscription);
	context.putPageValue("subscription",subscription);
		
}

init();


