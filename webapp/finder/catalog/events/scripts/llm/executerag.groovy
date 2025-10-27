package llm

import org.entermediadb.ai.assistant.AssistantManager
import org.entermediadb.asset.MediaArchive
import org.openedit.WebPageRequest

public void executeRAG(){
	WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");
	AssistantManager assistantManager = archive.getBean("assistantManager");
	assistantManager.executeRag(inReq, log);
}

executeRAG();
