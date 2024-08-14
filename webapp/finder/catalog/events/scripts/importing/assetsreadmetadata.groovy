package importing

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.scanner.MetaDataReader
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.locks.Lock
import org.openedit.repository.ContentItem

public void init()
{
		MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos
		
			Searcher searcher = archive.getAssetSearcher();
			//HitTracker assets = searcher.getAllHits();
			Collection assets = context.getPageValue("hits");
			
			if( assets == null)
			{
				HitTracker tracker = searcher.query().exact("importstatus","needsmetadata").sort("sourcepath").search();
				tracker.enableBulkOperations();
				tracker.setHitsPerPage(100);
				assets = tracker;
			}
			List assetsToSave = new ArrayList();
			MetaDataReader reader = moduleManager.getBean("metaDataReader");
			for (Data hit in assets)
			{
				Asset asset = (Asset)searcher.loadData(hit);
				//log.info("${asset.getSourcePath()}");
				if( asset != null)
				{
					ContentItem content = archive.getOriginalContent( asset );
					reader.populateAsset(archive, content, asset);
					asset.setProperty("importstatus", "imported");
					assetsToSave.add(asset);
					if(assetsToSave.size() == 100)
					{
						archive.saveAssets( assetsToSave );
						//archive.firePathEvent("importing/assetsimported",user,assetsToSave);
						assetsToSave.clear();
						log.info("saved 100 metadata readings");
					}
				}
			}
			archive.saveAssets assetsToSave;
			//archive.firePathEvent("importing/assetsimported",user,assetsToSave);
			//log.info("metadata reading complete");
			
		
}

init();