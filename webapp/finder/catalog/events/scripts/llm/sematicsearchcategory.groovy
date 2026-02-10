package asset

import org.entermediadb.ai.assistant.SearchingManager
import org.entermediadb.asset.*

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	SearchingManager manager = archive.getBean("searchingManager");
	
	manager.rescanSearchCategories(log);
		
}


init();
