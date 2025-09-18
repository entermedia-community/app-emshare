package llm

import java.util.Map;
import org.entermediadb.asset.Asset;
import org.entermediadb.asset.MediaArchive;
import org.entermediadb.translator.TranslationManager;
import org.json.simple.JSONObject;
import org.openedit.WebPageRequest;
import org.openedit.data.Searcher;
import org.openedit.data.*;
import org.openedit.hittracker.HitTracker;
import org.openedit.modules.translations.LanguageMap;
import org.openedit.Data;



public void translateOnFieldsEdit() {

	Map assetdata = context.getPageValue("data");
	Asset asset = assetdata.get("translateAsset");

	log.info("Translating asset: " + asset.getId());

	Map<String, String> translateFields = assetdata.get("translateFields");

	if(asset == null || translateFields == null) 
	{
		return;
	}

	MediaArchive archive = context.getPageValue("mediaarchive");
	Searcher searcher = archive.getAssetSearcher();
	PropertyDetails details = searcher.getPropertyDetails();

	TranslationManager manager = (TranslationManager) archive.getBean("translationManager");
	
	HitTracker locales = archive.query("locale").exact("translatemetadata", true).search();
	
	Collection<String> availableTargets = Arrays.asList("en,es,fr,de,ar,pt,bn,hi,ur,ru,zh-Hans,zh-Hant".split(","));
	
	Collection<String> checkfields = Arrays.asList(
		"headline",
		"longcaption",
		"assettitle",
		"alternatetext"
	);

	Map translations = new HashMap();

	for (Iterator iterator = translateFields.keySet().iterator(); iterator.hasNext();)
	{
		String field = (String) iterator.next();
		String sourceLang = translateFields.get(field);

		if (locales.size() == 1 && sourceLang.equals(locales.get(0).getId())) 
		{
			return;
		}
			
		Collection<String> targetLangs = new ArrayList();
		
		for (Iterator iterator2 = locales.iterator(); iterator2.hasNext();) 
		{
			Data locale = (Data) iterator2.next();
			String code = locale.getId();
			if(code == sourceLang)
			{
				continue;
			}
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


		try{
			long startTime = System.currentTimeMillis();
			
			LanguageMap languageMap = new LanguageMap();

			if (checkfields.contains(field))
			{
				PropertyDetail detail = archive.getAssetPropertyDetails().getDetail(field);
				if (detail != null && detail.isMultiLanguage())
				{
					
					Object value = asset.getValue(field);
					if(value == null)
					{
						continue;
					}
					if(value instanceof String) {
						languageMap.setText(sourceLang, value);
					} else {
						languageMap = (LanguageMap) value;
					}
				}
			}

			log.info("Translating field: " + field);
			
			LanguageMap result = manager.translateField(field, languageMap, sourceLang, targetLangs);

			if(result != null)
			{
				translations.put(field, result);
				log.info("Translation found for field: " + field);
			}
			
			long duration = (System.currentTimeMillis() - startTime) / 1000L;
			log.info("Took: "+duration +"s");
		} 
		catch(Exception e){
			log.error("Translation Error for field: " + field, e);
			continue;
		}

		if( translations.size() > 0)	{
			for (Iterator iterator3 = translations.keySet().iterator(); iterator3.hasNext();) 
			{
				String key = (String) iterator3.next();
				LanguageMap map = (LanguageMap) translations.get(key);
				asset.setValue(key, map);
			}
		}
	}
	archive.saveAsset(asset);
	log.info("Saved asset: " + asset.getId());
}

translateOnFieldsEdit();
