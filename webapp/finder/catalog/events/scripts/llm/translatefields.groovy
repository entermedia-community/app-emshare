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


public void translateFields() {

	MediaArchive archive = context.getPageValue("mediaarchive");
	Searcher searcher = archive.getAssetSearcher();
	PropertyDetails details = searcher.getPropertyDetails();

	HitTracker assets = context.getPageValue("hits");
	if( assets == null || assets.isEmpty())
	{
		assets = searcher.query()
		.exact("previewstatus", "2")
		.exact("taggedbyllm","true")
		.exact("translatesuccess","false")
		.exact("translaterror","false")
		.search();
	}
	
	assets.enableBulkOperations();

	if(assets.isEmpty())
	{
		log.info("No asset found");
		return;
	}

	TranslationManager manager = (TranslationManager) archive.getBean("translationManager");
	
	Collection locales = archive.getList("locale");

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

	int count = 1;

	for (hit in assets) {
		Asset asset = searcher.loadData(hit);

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
			
			long duration = (System.currentTimeMillis() - startTime) / 1000L;

			asset.setValue("translatesuccess", true);
			archive.saveAsset(asset);
			log.info("Took "+duration +"s");

		} 
		catch(Exception e){
			log.error("Translation Error", e);
			asset.setValue("translaterror", true);
			archive.saveAsset(asset);
			continue;
		}
	}
}

translateFields();
