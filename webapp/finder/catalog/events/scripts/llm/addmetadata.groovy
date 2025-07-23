package llm

import java.util.Map;
import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.llm.LLMManager
import org.entermediadb.llm.LLMResponse
import org.json.simple.JSONObject
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.ListHitTracker;
import org.openedit.repository.ContentItem

public void addMetadataWithAI(){

	//Create the MediaArchive object
	WebPageRequest inReq = context;
	MediaArchive archive = inReq.getPageValue("mediaarchive");
	Searcher searcher = archive.getAssetSearcher();
	//TODO:  get the bean to use programatically from catalog settings or something
	
	String model = archive.getCatalogSettingValue("llmvisionmodel");
	if(model == null) {
		model = "gpt-4o-mini";
	}
	String type = "gptManager";
	
	Data modelinfo = archive.query("llmmodel").exact("modelid",model).searchOne();
	
	if(modelinfo != null)
	{
		type = modelinfo.get("llmtype") + "Manager";
	}
	
	
	
	LLMManager manager = archive.getBean(type);
	def cat = archive.getCategorySearcher().getRootCategory();
	inReq.putPageValue("category", cat);

	//Refine this to use a hit tracker?
	HitTracker assets = searcher.query().exact("previewstatus", "2").exact("taggedbyllm","false").exact("llmerror","false").search();

	HitTracker assetsToTranslate = new ListHitTracker();
	
	if(assets.size() < 1)
	{
		return;
	}
	
	log.info("AI manager selected: " + type + " Model: "+ model + " - Adding metadata to: " + assets.size() + " assets");
	assets.enableBulkOperations();
	int count = 1;
	for (hit in assets) {
		Asset asset = archive.getAssetSearcher().loadData(hit);
		inReq.putPageValue("asset", asset);
		
		String mediatype = archive.getMediaRenderType(asset);
		String imagesize = null;
		if (mediatype == "image")
		{
			imagesize = "image3000x3000.jpg";
		}
		else if (mediatype == "video")
		{
			imagesize = "image1900x1080.jpg";
		}
		else {
			continue;
		}
		ContentItem item = archive.getGeneratedContent(asset, imagesize);
		if(!item.exists()) {
			
			log.info("Missing " + imagesize + " generated image for:" + asset.getName());
			continue;
		}
		

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
		

		log.info("Analyzing asset ("+count+"/"+assets.size()+") Id: " + asset.getId() + " " + asset.getName());
		

		String template = manager.loadInputFromTemplate(inReq, "/" +  archive.getMediaDbId() + "/gpt/systemmessage/analyzeasset.html");
		try{
			long startTime = System.currentTimeMillis();
			
			LLMResponse results = manager.callFunction(inReq, model, "generate_metadata", template, 0, 5000,base64EncodedString );
			
			long duration = (System.currentTimeMillis() - startTime) / 1000L;

			if (results != null)
			{
				JSONObject arguments = results.getArguments();
				if (arguments != null) {

					Map metadata =  (Map) arguments.get("metadata");
	
					String caption = (String) metadata.get("caption");
					if(caption != null) {
						asset.setValue("headline", caption);
						log.info("Headline: "+caption);
					}
					String description = (String) metadata.get("longcaption");
					if(description != null) {
						asset.setValue("longcaption", description);
						log.info("Long Caption: "+description);
					}
					String assettitle = (String) metadata.get("assettitle");
					if(assettitle != null) {
						asset.setValue("assettitle", assettitle);
						log.info("Asset Title: "+assettitle);
					}
					String keywords = (String) metadata.get("keywords");
					if(keywords != null) {
						Collection<String> keywordlist = Arrays.asList(keywords.split(","));
						asset.setValue("keywordsai", keywordlist);
						log.info("Keywords AI: "+keywords);
					}
					String alttext = (String) metadata.get("alttext");
					if(alttext != null) {
						asset.setValue("alternatetext", alttext);
						log.info("Alt Text: "+alttext);
					}
					assetsToTranslate.add(hit);
				}
				else {
					log.info("Asset "+asset.getId() +" "+asset.getName()+" - Nothing Detected.");
				}
			}
			
			asset.setValue("taggedbyllm", true);
			archive.saveAsset(asset);
			log.info("Took "+duration +"s");
		}
		catch(Exception e){
			log.error("LLM Error", e);
			asset.setValue("llmerror", true);
			archive.saveAsset(asset);
			continue;
		}	
	}
	if(assetsToTranslate.size() > 0)
	{
		archive.firePathEvent("llm/translatefields", inReq.getUser(), assetsToTranslate);
	}
}

addMetadataWithAI();

