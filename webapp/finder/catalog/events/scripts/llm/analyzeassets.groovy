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
	
	if(assets.size() < 1)
	{
		return;
	}
	
	log.info("AI manager selected: " + type + " Model: "+ model + " - Tagging: " + assets.size() + " assets");
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
			
			if (results != null)
			{
				long duration = (System.currentTimeMillis() - startTime) / 1000L;
				JSONObject arguments = results.getArguments();
				if (arguments != null) {

					int detected =  manager.copyData(arguments, asset);
					if (detected > 0)
					{
						log.info(" Asset "+asset.getId() +" "+ asset.getName()+" - Detected: " + detected);
					}
				}
				else {
					log.info("Asset "+asset.getId() +" "+asset.getName()+" - Nothing Detected.");
				}
				asset.setValue("taggedbyllm", true);
				archive.saveAsset(asset);
				log.info("Took "+duration +"s");
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

tagAssets();





