package asset

import org.entermediadb.ai.classify.SemanticClassifier
import org.entermediadb.asset.*
public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	SemanticClassifier manager = archive.getBean("semanticClassifier");
	
	manager.indexAll(log);
		
}


init();
