package llm

import org.entermediadb.ai.classify.ClassifyManager
import org.entermediadb.asset.MediaArchive
import org.openedit.WebPageRequest

public void addMetadataWithAI(){

	WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");
	ClassifyManager classifyManager = archive.getBean("classifyManager");
	classifyManager.scanMetadataWithAIAsset(log);
	
	archive.fireSharedMediaEvent("llm/translatefields");
	
	classifyManager.scanMetadataWithAIEntity(log);
}

addMetadataWithAI();
