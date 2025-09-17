package asset

import org.entermediadb.ai.classify.SemanticFieldsManager
import org.entermediadb.asset.*
import org.openedit.locks.Lock

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	SemanticFieldsManager manager = archive.getBean("semanticFieldsManager");
	manager.indexAll(log);
		
}


init();
