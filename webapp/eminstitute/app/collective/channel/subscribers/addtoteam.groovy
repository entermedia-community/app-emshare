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
	String firstName = context.getRequestParameter("firstName.value");
	String lastName = context.getRequestParameter("lastName.value");
	String email = context.getRequestParameter("email.value");
	if(email) {
		email = email.trim().toLowerCase();
	}
	String teamuserid = context.getRequestParameter("teamuserid");
	String addtoteam = context.getRequestParameter("addtoteam");
	
	User teamuser = null;
/* Check for duplicate email. */
	if (teamuserid != null) 
	{
		teamuser = archive.getUserManager().getUser(teamuserid);			
	}
	else if (email != null) {
		teamuser = archive.getUserManager().getUserByEmail(email);
	}
	if( teamuser == null)
	{
		String	password = new PasswordGenerator().generate();
			
		teamuser = archive.getUserManager().createUser(null, password);
		teamuser.setFirstName(firstName);
		teamuser.setLastName(lastName);
		teamuser.setEmail(email.trim().toLowerCase());
		teamuser.setEnabled(true);
		archive.getUserManager().saveUser(teamuser);
	}
	
	
	Data subscription = archive.query("librarycollectionusers").exact("followeruser", teamuser.getId()).exact("collectionid", collectionid).searchOne();
	if (subscription != null)
	{
		//exists, but is ontheteam?
		if (subscription.getValue("ontheteam") != "true" && addtoteam == "true") {
			subscription.setValue("ontheteam",true);
			archive.getSearcher("librarycollectionusers").saveData(subscription);
		} 
	}
	else
	{
		subscription = archive.getSearcher("librarycollectionusers").createNewData();
		subscription.setValue("collectionid",collectionid);
		subscription.setValue("followeruser",teamuser.getId());
		if (addtoteam == "true") {
			subscription.setValue("ontheteam",true);
		}
		subscription.setValue("addeddate",new Date());
		archive.getSearcher("librarycollectionusers").saveData(subscription);
	}
	context.putPageValue("subscription",subscription);
		
	
	String template = context.findValue("apphome") + "/theme/emails/collection-add-teammember.html";

	WebEmail templatemail = archive.createSystemEmail(teamuser, template);
	templatemail.setSubject("Added to Team"); //TODO: Translate
	Map objects = new HashMap();
	String entermediakey = archive.userManager.getEnterMediaKey(teamuser);
	objects.put("entermediakey",entermediakey);
	objects.put("user", context.getUser());
	objects.put("teamuser",teamuser);
	Data librarycol = archive.getData("librarycollection", collectionid);
	objects.put("librarycol", librarycol);
	objects.put("apphome", context.findValue("apphome"));
	templatemail.send(objects);
			
}

init();


