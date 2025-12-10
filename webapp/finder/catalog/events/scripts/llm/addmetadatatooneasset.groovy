package llm

import org.entermediadb.ai.informatics.InformaticsManager
import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.openedit.WebPageRequest

public void addMetadataWithAI(){

	WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");
	InformaticsManager informaticsManager = archive.getBean("informaticsManager");
	
	String assetid = inReq.getRequestParameter("assetid");
	Asset asset = archive.getAsset(assetid);
	if (asset != null)
	{
		log.info("Processing individual asset:" + asset.getName());
		informaticsManager.processAsset(log, asset);
		inReq.putPageValue("asset", asset);
	}
	//informaticsManager.scanMetadataWithAIEntity(log);
}

addMetadataWithAI();
