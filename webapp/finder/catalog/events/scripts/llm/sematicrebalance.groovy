package asset

import org.entermediadb.ai.semantics.SemanticFieldsManager
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
		SemanticFieldsManager manager = archive.getBean("semanticFieldsManager");
		manager.reBalance(log);
		
	}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
