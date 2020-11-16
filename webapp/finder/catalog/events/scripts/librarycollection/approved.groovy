package librarycollection;

import org.entermediadb.asset.MediaArchive
import org.entermediadb.email.WebEmail
import org.openedit.Data
import org.openedit.OpenEditException
import org.openedit.profile.UserProfile
import org.openedit.users.User


public void init()
{
	MediaArchive mediaArchive = (MediaArchive)context.getPageValue("mediaarchive");
	String appid =  mediaArchive.getCatalogSettingValue("events_notify_app");
	List assets = context.getPageValue("assetids");
	String owner = context.getRequestParameter("owner");
	User user = context.get("user");
	if( owner == null )
	{
		throw new OpenEditException("Owner is required");
	}
//	if(owner.equals(user.getId())){
//		return;
//	}
//	
	
	
	UserProfile profile = mediaArchive.getData("userprofile", owner);
	if( profile == null)
	{
		throw new OpenEditException("No profile found " + owner);
	}
	if(profile.getBoolean("sendapprovalnotifications") == true  ){
		String template = "/" + profile.get("lastviewedapp") + "/theme/emails/collection-assets-approved.html";
		String note = context.getPageValue("note");
		
		Data librarycol = mediaArchive.getData("librarycollection", context.getPageValue("librarycollection"));
		User target = mediaArchive.getData("user", owner);
		WebEmail templatemail = mediaArchive.createSystemEmail(target, template);
		templatemail.setSubject("[EM] Asset Approvals Notification"); //TODO: Translate
		Map objects = new HashMap();
		objects.put("assets",assets);
		objects.put("librarycol",librarycol);
		objects.put("note",note);
		objects.put("mediaarchive",mediaArchive);
		
		objects.put("apphome","/" + appid);
		templatemail.send(objects);
	}
	
}

init();

