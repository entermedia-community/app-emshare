package llm

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.llm.LLMManager
import org.entermediadb.llm.LLMResponse
import org.json.simple.JSONObject
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.PropertyDetail
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.repository.ContentItem

public void addMetadataWithAI(){

	WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");
	Searcher searcher = archive.getAssetSearcher();

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
	
	if (!manager.isReady())
	{
		log.info("LLM Manager is not ready: " + type + " Model: " + model + ". Verify LLM Server and Key.");
		return; // Not ready, so we cannot proceed
	}
	
	
	String categoryid	 = archive.getCatalogSettingValue("llmmetadatastartcategory");
	
	if (categoryid == null)
    {
        categoryid = "index";
    }
	
	//Refine this to use a hit tracker?
	HitTracker assets = archive.query("asset").exact("previewstatus", "2").exact("category", categoryid).exact("taggedbyllm",false).exact("llmerror",false).search();
	if(assets.size() < 1)
	{
		return;
	}

	log.info("AI manager selected: " + type + " Model: "+ model + " - Adding metadata to: " + assets.size() + " assets in category: " + categoryid);
	
	assets.enableBulkOperations();
	int count = 1;
	List tosave = new ArrayList();
	for (hit in assets) {
		Asset asset = archive.getAsset(hit.id);
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
		count++;

		
		try{
			long startTime = System.currentTimeMillis();
			
			Collection aifields = archive.getAssetPropertyDetails().findAiCreationProperties();
			inReq.putPageValue("aifields", aifields);
			
			String template = manager.loadInputFromTemplate(inReq, "/" +  archive.getMediaDbId() + "/gpt/systemmessage/analyzeasset.html");
			LLMResponse results = manager.callFunction(inReq, model, "generate_metadata", template, 0, 5000,base64EncodedString );

			boolean wasUpdated = false;
			if (results != null)
			{
				JSONObject arguments = results.getArguments();
				if (arguments != null) {

					Map metadata =  (Map) arguments.get("metadata");
					Map datachanges = new HashSet();
					for (Iterator iterator = metadata.keySet().iterator(); iterator.hasNext();)
					{
						String inKey = (String) iterator.next();
						PropertyDetail detail = archive.getAssetPropertyDetails().getDetail(inKey);
						if (detail != null && asset.getValue(detail.id) == null)
						{
							String value = metadata.get(inKey);
							if (detail.isMultiValue())
							{
								Collection<String> values = Arrays.asList(value.split(","));
								datachanges.set(detail.id, values);
							}
							else 
							{
								datachanges.set(detail.id, value);
							}
						}
					}
					
					//Save change event
					User agent = archive.getUser("agent");
					if( agent == null)
					{
						//thrrow exception
					}
					archive.getEventManager().fireDataEditEvent(archive.getAssetSearcher(), agent, null, asset, datachanges);
					
					for (Iterator iterator = datachanges.keySet().iterator(); iterator.hasNext();)
					{
						String inKey = (String) iterator.next();
						Object value = metadata.get(inKey);
						asset.setValue(inKey, value);
						log.info("AI updated field "+ inKey + ": "+metadata.get(inKey));
					}
				}
				else {
					log.info("Asset "+asset.getId() +" "+asset.getName()+" - Nothing Detected.");
				}
			}

			asset.setValue("taggedbyllm", true);
			tosave.add(asset);
			//archive.saveAsset(asset);

			long duration = (System.currentTimeMillis() - startTime) / 1000L;
			log.info("Took "+duration +"s");
			
			if( tosave.size() == 1000)	{
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
	archive.saveAssets(tosave);
	log.info("Saved: " + tosave.size() + " assets - " + searcher.getSearchType());
	tosave.clear();
	

	archive.firePathEvent("llm/translatefields", inReq.getUser(), null);

}

addMetadataWithAI();
