package asset

import org.entermediadb.ai.classify.SemanticFieldManager
import org.entermediadb.asset.*
public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	SemanticFieldManager manager = archive.getBean("semanticFieldManager");
	manager.indexAll(log);
		
}


init();
