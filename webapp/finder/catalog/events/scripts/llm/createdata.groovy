package llm

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.llm.GptManager
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.repository.ContentItem

import com.google.gson.JsonObject

import groovy.json.JsonSlurper

public void tagAssets(){

	//Create the MediaArchive object
	WebPageRequest inReq = context;
	MediaArchive archive = inReq.getPageValue("mediaarchive");
	Searcher searcher = archive.getAssetSearcher();
	//TODO:  get the bean to use programatically from catalog settings or something
	GptManager manager = archive.getBean("openaiConnection");
	def cat = archive.getCategorySearcher().getRootCategory();
	Map params = new HashMap();
	params.put("category", cat);

	//Refine this to use a hit tracker?
	HitTracker assets = searcher.getAllHits();
	String model = inReq.findValue("model.value");
	if(model == null) {
		model = archive.getCatalogSettingValue("llmmetadatamodel");
	}

	if(model==null) {
		//model = "gpt-3.5-turbo-16k-0613";
		model="gpt-5-nano";
	}

	for (hit in assets) {
		Asset asset = archive.getAsset(hit.id);
		params.put("asset", asset);

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



			String template = manager.loadInputFromTemplate(archive.getCatalogId() + "/gpt/templates/analyzeasset.html", params);
			try{

				JsonObject results = manager.callFunction(params, model, "generate_metadata", template, 0, 5000,base64EncodedString );
				def jsonSlurper = new JsonSlurper()
				def result = jsonSlurper.parseText(results.toString());
				result.metadata.each { key, value ->
					if(!asset.getValue(key)){
						asset.setValue(key, value);
					}
				}
				archive.saveAsset(asset);
			}
			catch(Exception e){
				log.info(e);
			}
		}
	}
}

tagAssets();





