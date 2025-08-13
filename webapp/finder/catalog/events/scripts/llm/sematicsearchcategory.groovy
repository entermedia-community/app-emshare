package asset

import org.entermediadb.ai.semantics.SemanticIndexManager
import org.entermediadb.asset.*
import org.openedit.locks.Lock

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	SemanticIndexManager manager = archive.getBean("semanticIndexManager");
	
	manager.rescanSearchCategories();
		
}


init();
