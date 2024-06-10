package importing

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init()
{
		MediaArchive archive = context.getPageValue("mediaarchive");
		Searcher searcher = archive.getAssetSearcher();
		Integer pagesize = 200;
		
		HitTracker assets = searcher.query().exact("importstatus","complete").sort("sourcepath").search();
		assets.enableBulkOperations();
		
		List assetsToSave = new ArrayList();
		for (Data hit in assets)
		{
			Asset asset = searcher.loadData(hit);
			asset.setValue("importstatus","needsmetadata" );
			assetsToSave.add(asset);
			if( assetsToSave.size() == 1000)
			{
				searcher.saveAllData(assetsToSave, null);
				assetsToSave.clear();
			}
		}		
		searcher.saveAllData(assetsToSave, null)
		archive.fireSharedMediaEvent("importing/assetsreadmetadata");
		
}

init();