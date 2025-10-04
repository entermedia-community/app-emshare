package asset

import org.entermediadb.ai.assistant.AssistantManager
import org.entermediadb.asset.*

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	AssistantManager manager = archive.getBean("assistantManager");
	
	manager.rescanSearchCategories();
		
}


init();
