import org.entermediadb.ai.assistant.AssistantManager
import org.entermediadb.asset.MediaArchive

public void init() {
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	AssistantManager manager = (AssistantManager) archive.getBean("assistantManager");

	manager.monitorAiServers(log);

	
	
}


init();