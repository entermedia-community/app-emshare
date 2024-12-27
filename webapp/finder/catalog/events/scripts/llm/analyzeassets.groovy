package llm

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.llm.LLMManager
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
	
	if(type == null) {
		type = "gptManager";
	} else {
		type = type + "Manager";
	}	
	LLMManager manager = archive.getBean(type);
	def cat = archive.getCategorySearcher().getRootCategory();
	inReq.putPageValue("category", cat);

	//Refine this to use a hit tracker?
	HitTracker assets = searcher.query().exact("taggedbyllm","false").search();
	
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



			String template = manager.loadInputFromTemplate(inReq, "/" +  archive.getMediaDbId() + "/gpt/templates/analyzeasset.html");
			try{

				JSONObject results = manager.callFunction(inReq, model, "generate_metadata", template, 0, 5000,base64EncodedString );
				def jsonSlurper = new JsonSlurper()
				def result = jsonSlurper.parseText(results.toJSONString());
				result.metadata.each { key, value ->
					if(!asset.getValue(key)){
						asset.setValue(key, value);
					}
				}
				asset.setValue("taggedbyllm", true);
				archive.saveAsset(asset);
			}
			catch(Exception e){
				log.info(e);
			}
		}
	}
}

tagAssets();





