package asset

import org.entermediadb.ai.classify.SemanticCassifier
import org.entermediadb.asset.*
public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	SemanticCassifier manager = archive.getBean("semanticCassifier");
	
	manager.indexAll(log);
		
}


init();
