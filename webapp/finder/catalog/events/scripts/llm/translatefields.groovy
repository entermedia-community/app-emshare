package llm

import java.util.Map;
import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.translator.TranslationManager
import org.json.simple.JSONObject
import org.openedit.data.Searcher
import org.openedit.data.*
import org.openedit.hittracker.HitTracker
import org.openedit.modules.translations.LanguageMap;
import org.openedit.Data;



public void translateMultilingualFields() {

	MediaArchive archive = context.getPageValue("mediaarchive");
	Searcher searcher = archive.getAssetSearcher();
	PropertyDetails details = searcher.getPropertyDetails();

	TranslationManager manager = (TranslationManager) archive.getBean("translationManager");
	
	HitTracker locales = archive.query("locale").exact("translatemetadata", true).search();
	
	if (locales.size() == 1 && "en".equals(locales.get(0).getId())) 
    {
        //log.info("No locales found for translation, defaulting to English");
        return; // No locales to translate, so we exit
    }

	Collection<String> availableTargets = Arrays.asList("en,es,fr,de,ar,pt,bn,hi,ur,ru,zh-Hans,zh-Hant".split(","));
	
	Collection<String> targetLangs = new ArrayList();

	for (Iterator iterator = locales.iterator(); iterator.hasNext();) 
	{
		Data locale = (Data) iterator.next();
		String code = locale.getId();
		if ("zh".equals(code))
		{
			code = "zh-Hans";
		}
		else if ("zh_TW".equals(code))
		{
			code = "zh-Hant";
		}
		if(availableTargets.contains(code))
		{
			targetLangs.add(code);
		}
	}
	
	HitTracker assets = context.getPageValue("assetsToTranslate");
	
	if( assets == null || assets.isEmpty())
	{
		assets = searcher.query()
		.exact("previewstatus", "2")
		.exact("taggedbyllm", true)
		.exact("translatesuccess",false)
		.exact("translaterror",false)
		.search();
		assets.enableBulkOperations();
	}

	if(assets.isEmpty())
	{
		//log.info("No asset found for Metadata Translation");
		return;
	}

	int count = 1;
	List tosave = new ArrayList();
	for (hit in assets) {
		Asset asset = archive.getAsset(hit.id);

		log.info("Translating asset (" + count + "/" + assets.size() + ") Id: " + asset.getId() + ", " + asset.getName());
		count++;

		try{
			long startTime = System.currentTimeMillis();

			Collection<String> checkfields = Arrays.asList(
				"headline",
				"longcaption",
				"assettitle",
				"alternatetext"
			);

			Map fieldsmap = new HashMap();

			for (Iterator iterator = checkfields.iterator(); iterator.hasNext();)
			{
				String inKey = (String) iterator.next();
				PropertyDetail detail = archive.getAssetPropertyDetails().getDetail(inKey);
				if (detail != null && detail.isMultiLanguage())
				{
					
					Object value = asset.getValue(inKey);
					if(value instanceof String) {
						LanguageMap lm = new LanguageMap();
						lm.setText("en", value);
						value = lm;
					}
					fieldsmap.put(inKey, value);
				}
			} 

			Map<String, LanguageMap> results = manager.translateFields(fieldsmap, "en", targetLangs);

			if(results != null)
			{
				for (Iterator iterator = results.keySet().iterator(); iterator.hasNext();) 
				{
					String key = (String) iterator.next();
					LanguageMap map = results.get(key);
					asset.setValue(key, map);
				}
				log.info("Found translation for "+ asset.getId() + ", " + asset.getName());
			}
			
			asset.setValue("translatesuccess", true);
			tosave.add(asset);
			long duration = (System.currentTimeMillis() - startTime) / 1000L;
			log.info("Asset translation took: "+duration +"s");
			
		} 
		catch(Exception e){
			log.error("Translation Error", e);
			asset.setValue("translaterror", true);
			tosave.add(asset);
			continue;
		}
		if( tosave.size() == 1000)	{
			archive.saveAssets(tosave);
			//searcher.saveAllData(tosave, null);
			log.info("Saved: " + tosave.size() + " assets - " + searcher.getSearchType());
			tosave.clear();
		}
		
	}
	archive.saveAssets(tosave);
	log.info("Saved: " + tosave.size() + " assets - " + searcher.getSearchType());
	tosave.clear();
}

translateMultilingualFields();
