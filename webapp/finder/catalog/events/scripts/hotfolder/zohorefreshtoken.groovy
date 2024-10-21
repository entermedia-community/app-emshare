import org.entermediadb.asset.MediaArchive
import org.entermediadb.zoho.ZohoManager


public void init()
{
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	
	ZohoManager manager = archive.getBean("zohoManager");
	
	manager.refreshToken();
}

init();	