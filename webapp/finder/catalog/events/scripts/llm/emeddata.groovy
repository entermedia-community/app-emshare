package llm

import org.entermediadb.ai.classify.EmbeddingManager
import org.entermediadb.asset.MediaArchive
import org.openedit.WebPageRequest

public void embedDataForAI(){

	// WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");
	EmbeddingManager embeddingManager = archive.getBean("embeddingManager");
	embeddingManager.processAll(log);
}

embedDataForAI();
