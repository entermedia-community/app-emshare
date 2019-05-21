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
	}		
}

init2();


