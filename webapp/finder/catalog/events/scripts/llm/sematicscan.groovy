package asset

import org.entermediadb.ai.classify.SemanticCassifier
import org.entermediadb.asset.*
public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	SemanticCassifier manager = archive.getBean("semanticCassifier");
	manager.indexAll(log);
		
}


init();
