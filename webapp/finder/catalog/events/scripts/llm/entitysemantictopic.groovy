package llm

import org.apache.commons.collections.map.HashedMap
import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.llm.LlmConnection
import org.entermediadb.llm.LLMResponse
import org.json.simple.JSONObject
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.PropertyDetail
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.repository.ContentItem
import org.openedit.users.User
import org.openedit.util.Exec
import org.openedit.util.ExecResult

public void getEntitySemanticTopics(){
	

	WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");

	String model = archive.getCatalogSettingValue("llmvisionmodel");
	if(model == null) {
		model = "gpt-4o-mini";
	}
	
	LlmConnection manager = archive.getLlmConnection(model);
	
	if (!manager.isReady())
	{
		log.info("LLM Manager is not ready: " + type + " Model: " + model + ". Verify LLM Server and Key.");
		return;
	}

	HitTracker allmodules = archive.query("module").exact("semanticenabled", true).search();
	Collection<String> ids = allmodules.collectValues("id");
	
	QueryBuilder query = archive.getSearcher("modulesearch").query();
	query.exact("semanticindexed", false);
	query.exists("semantictopics");
	query.put("searchtypes", ids);
	
	HitTracker hits = query.search();
	hits.enableBulkOperations();
	
	List tosave = new ArrayList();
	
	Exec exec = archive.getBean("exec");
	
	int count = 0;

	for (hit in hits) {
		log.info("Analyzing entity ("+count+"/"+hits.size()+") Id: " + hit.getId() + " " + hit.getName());
		count++;

		try{
			long startTime = System.currentTimeMillis();
			
			if(asset.getValue("semantictopics") == null || asset.getValues("semantictopics").isEmpty())
			{
				Collection<String> semantic_topics = manager.getSemanticTopics(inReq, model);
				if(semantic_topics != null && !semantic_topics.isEmpty())
				{
					asset.setValue("semantictopics", semantic_topics);
					log.info("AI updated semantic topics: " + semantic_topics);
				}
				else
				{
					log.info("No semantic topics detected for asset: " + asset.getId() + " " + asset.getName());
				}
			}

			asset.setValue("taggedbyllm", true);
			tosave.add(asset);
			//archive.saveAsset(asset);

			long duration = (System.currentTimeMillis() - startTime) / 1000L;
			log.info("Took "+duration +"s");
			
			if( tosave.size() == 25)	{
				archive.saveAssets(tosave);
				//searcher.saveAllData(tosave, null);
				log.info("Saved: " + tosave.size() + " assets - " + searcher.getSearchType());
				tosave.clear();
			}
		}
		catch(Exception e){
			log.error("LLM Error", e);
			asset.setValue("llmerror", true);
			archive.saveAsset(asset);
			continue;
		}	
	}
	if( tosave.size() > 0)	{
		archive.saveAssets(tosave);
		log.info("Saved: " + tosave.size() + " assets - " + searcher.getSearchType());
	}

}

getEntitySemanticTopics();
