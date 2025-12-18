package asset

import org.entermediadb.ai.classify.SemanticClassifier
import org.entermediadb.ai.informatics.SemanticTableManager
import org.entermediadb.asset.*
import org.openedit.locks.Lock

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	Lock lock = archive.getLockManager().lockIfPossible("semanticscanning", "admin");
	
	if( lock == null)
	{
		log.info("Semantic scanning already in progress");
		return;
	}
	
	try
	{
		SemanticClassifier manager = archive.getBean("semanticClassifier");
		SemanticTableManager table = manager.loadSemanticTableManager("semantictopics");
		table.reBalance(log);
}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
