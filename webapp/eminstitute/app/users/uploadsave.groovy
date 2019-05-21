package importing;

import org.entermediadb.asset.*;
import org.openedit.users.*;


public void init2()
{
	MediaArchive archive = context.getPageValue("mediaarchive");
	Collection assets = context.getPageValue("assets");
	if( assets != null)
	{
		Asset onefile = assets.iterator().next();
		User edituser =  context.getPageValue("selecteduser");
		edituser.setValue("assetportrait",onefile.getId());
		archive.saveData("user",edituser);
		if( edituser.getId().equals(  context.getUser().getId() ) )
		{
				String catalogid = context.findValue("catalogid");
				context.putSessionValue(catalogid + "user",edituser);
				context.putPageValue("user",edituser);
		}
	}	
}

init2();


