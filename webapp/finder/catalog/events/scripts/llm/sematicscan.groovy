package asset

import org.entermediadb.ai.classify.SemanticClassifier
import org.entermediadb.ai.informatics.SemanticTableManager
import org.entermediadb.asset.*
public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	SemanticClassifier manager = archive.getBean("semanticClassifier");
	
	SemanticTableManager table = manager.loadSemanticTableManager("semantictopics");
	table.indexAll(log);
		
}


init();
