package asset

import org.entermediadb.ai.semantics.SemanticIndexManager
import org.entermediadb.asset.*
import org.openedit.locks.Lock

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	Lock lock = archive.getLockManager().lockIfPossible("semanticscanning", "admin");
	
	if( lock == null)
	{
		log.info("Semantic scanning already in progress");
		return;
	}
	
	try
	{	
		SemanticIndexManager manager = archive.getBean("semanticIndexManager");
		manager.indexAll(log);
		
	}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
