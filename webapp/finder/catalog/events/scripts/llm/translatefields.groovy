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
	TranslationManager manager = (TranslationManager) archive.getBean("translationManager");
	manager.translateAssets(context, log);
	
}

translateMultilingualFields();
