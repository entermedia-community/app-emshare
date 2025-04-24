package librarycollection;

import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker


public void init(){
	System.out.println("import products");
	WebPageRequest req = context;

	MediaArchive archive = req.getPageValue("mediaarchive");
	Searcher searcher = archive.getSearcher("librarycollection");

	HitTracker collections = searcher.getAllHits();
	
	List<String> keepids = Arrays.asList(
            "1", "2", "4", "16", "31", "33", "AYK2g_50JGTAyXQuFY-q", 
            "AYKigfWhzT-qdjc1ZmOb", "AYPtK6OKX2MrsAUtBQHn", "AX4rFrxsobhBGk1GuFqA", 
            "AXAbPuKMSF-tu0t4AA2z", "AXAw73huSF-tu0t4AB2r", "AXT_mzfbCp1_Af7N6FGY", 
            "AXc6Rje3lyEeD76FPBkS", "AXjcGw48vVVVkOMYhpre", "AW60OQcrQc9HlOAx9gaG", 
            "AWbF2OEfzBh81y9Kc8mC", "AWbFzIH-zBh81y9Kc8l3", "AWltsK1TK6h6W8L8Zpbu", 
            "AWyMCKc-lLiPJ1DgUGBj", "AWyMCTHvlLiPJ1DgUGBl", "AZB1Nc8EC6B2DFydQvP0", 
            "AZILMPRcC6B2DFydRbnG", "AZZeuBy8C6B2DFydTRy3");
	collections.enableBulkOperations();
	collections.each
	{
			if (!keepids.contains(it.id))
			{
				Data collection = archive.getData("librarycollection", it.id);
				searcher.delete(collection, null);
				log.info("deleted " + it.id)
			}
	}
}
init();

