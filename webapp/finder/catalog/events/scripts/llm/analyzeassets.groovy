package llm

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.llm.LLMManager
import org.entermediadb.llm.LLMResponse
import org.json.simple.JSONObject
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.repository.ContentItem

import groovy.json.JsonSlurper

public void tagAssets(){

	//Create the MediaArchive object
	WebPageRequest inReq = context;
	MediaArchive archive = inReq.getPageValue("mediaarchive");
	Searcher searcher = archive.getAssetSearcher();
	//TODO:  get the bean to use programatically from catalog settings or something
	
	String model = archive.getCatalogSettingValue("llmvisionmodel");
	if(model == null) {
		model = "gpt-4o-mini";
	}
	Data modelinfo = archive.getData("llmmodel", model);

	String type = modelinfo != null ?  modelinfo.get("llmtype") : null;
	
	log.info("AI manager selected: " + type + " Model: "+ model);
	if(type == null) {
		type = "gptManager";
	} else {
		type = type + "Manager";
	}	
	LLMManager manager = archive.getBean(type);
	def cat = archive.getCategorySearcher().getRootCategory();
	inReq.putPageValue("category", cat);

	//Refine this to use a hit tracker?
	HitTracker assets = searcher.query().exact("taggedbyllm","false").exact("llmerror","false").search();
	
	if(assets.size() < 1)
	{
		return;
	}

	log.info("Tagging: " + assets.size() + " assets");
	for (hit in assets) {
		Asset asset = archive.getAsset(hit.id);
		inReq.putPageValue("asset", asset);

		ContentItem item = archive.getGeneratedContent(asset, "image3000x3000.jpg");
		if(item.exists()) {

			InputStream inputStream = item.getInputStream()
			String base64EncodedString = ''
			try {
				byte[] bytes = inputStream.bytes // Read InputStream as bytes
				base64EncodedString = Base64.getEncoder().encodeToString(bytes) // Encode to Base64
			} catch (Exception e) {
				log.info("Error encoding asset to Base64: ${e}")
			} finally {
				inputStream.close() // Close the InputStream
			}

			log.info("Analyzing asset: (" + asset.getId() + ") " + asset.getName());
			
			inReq.putPageValue("asset",asset);
			
			String template = manager.loadInputFromTemplate(inReq, "/" +  archive.getMediaDbId() + "/gpt/systemmessage/analyzeasset.html");
			try{
				long startTime = System.currentTimeMillis();
				LLMResponse results = manager.callFunction(inReq, model, "generate_metadata", template, 0, 5000,base64EncodedString );
				
				if (results != null)
				{
					JSONObject arguments = results.getArguments();
					//log.info(arguments);
					long duration = (System.currentTimeMillis() - startTime) / 1000L;
					if (arguments != null) {
						def jsonSlurper = new JsonSlurper();
						def result = jsonSlurper.parseText(results.getArguments().toJSONString());  //Why are you doing this?
						HashMap detected = new HashMap();
						
						result.metadata.each { key, value ->
							if(key =="googlekeywords" || asset.getValue(key) == null)
							{
								asset.setValue(key, value);
								detected.put(key, value);
							}
						}
						if (detected.size() > 0)
						{
							log.info("("+asset.getId() +") "+ asset.getName()+" - Detected: " + detected + " Took: "+duration +"s");
						}
						else 
						{
							log.info("("+asset.getId() +") "+ asset.getName()+" - Detected but not saved: "  + result + " Took: "+duration +"s")
						}
					}
					else {
						log.info("("+asset.getId() +") "+asset.getName()+" - Nothing Detected." + " Took: "+duration +"s");
					}
					asset.setValue("taggedbyllm", true);
					archive.saveAsset(asset);
				}
			}
			catch(Exception e){
				log.error("LLM Error", e);
				asset.setValue("llmerror", true);
				archive.saveAsset(asset);
				continue;
			}
			
		}
	}
}

tagAssets();





