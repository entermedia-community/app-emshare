package llm

import org.entermediadb.ai.iInformatics.InformaticsManager
import org.entermediadb.asset.MediaArchive
import org.openedit.WebPageRequest

public void addMetadataWithAI(){

	WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");
	InformaticsManager informaticsManager = archive.getBean("informaticsManager");
	informaticsManager.processAll(log);
	//informaticsManager.scanMetadataWithAIEntity(log);
}

addMetadataWithAI();
