import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init() {
	
	String searcherid = "asset";
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	Searcher searcher = archive.getSearcher(searcherid);
	HitTracker rows = searcher.getAllHits();

	ArrayList saveAll = new ArrayList();
	rows.enableBulkOperations();
	int count = 0;
	rows.each{
		String id = it.id;
	
		Data row = searcher.loadData(id);
		
		
		row.setValue("taggedbyllm", false);
		row.setValue("llmerror", false);
		row.setValue("keywordsai", null);
		row.setValue("semanticindexed", false);
		row.setValue("semantictopics", null);
		row.setValue("searchcategory", null);
		
		//row.setValue("headline", null);
		//row.setValue("longcaption", null);
		
		saveAll.add(row);
		count ++;
		if(saveAll.size()> 1000)
		{
			searcher.saveAllData(saveAll, null);
			log.info("Saved " + count);
			saveAll.clear();
		}
		
		/*
		// Change Import Status and Preview Status  
		 
		String type = archive.getMediaRenderType(row);
		if(type == "image") 
		{
			if(row.get("importstatus") == "imported")
			{
				row.setValue("importstatus", "created");
				saveAll.add(row);
				count ++;
			}
		}
		else 
		{
			if(row.get("previewstatus") != "mime")
				{
					row.setValue("previewstatus", "mime");
					saveAll.add(row);
					count ++;
				}
		}
		
		
		*/
		/*
		String keywords = row.get("knowledgebase_tag");
		if (keywords != null)
		{
			String fixedkeywords = keywords.replace(",", "|");
			log.info("Fix: " + fixedkeywords);
			row.setValue("knowledgebase_tag", fixedkeywords);
			saveAll.add(row);
		}
	
		
		String sourcepath = row.get("sourcepath");
		if (sourcepath != null && sourcepath.length() > 2 && sourcepath.charAt(sourcepath.length() - 1) == '/')
		{
			String   fixed = sourcepath.substring(0, sourcepath.length() - 1) + ".html";
			log.info("Fix: " + sourcepath + " -> " + fixed);
			row.setValue("sourcepath", fixed);
			saveAll.add(row);
		}
		*/	
		
	}
	searcher.saveAllData(saveAll, null);
	log.info("Saved " + count);
	archive.fireSharedMediaEvent("importing/assetscreated");
	
}


init();