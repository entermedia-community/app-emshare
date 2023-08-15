package asset

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.util.TimeParser
import org.entermediadb.asset.xmp.XmpWriter
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.page.manage.PageManager


public init()
{
	
	MediaArchive mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	PageManager pageManager = mediaarchive.getPageManager();
	XmpWriter writer = (XmpWriter) mediaarchive.getModuleManager().getBean("xmpWriter");
	
	Searcher searcher = mediaarchive.getSearcher("asset");
	
	//Limit query
	TimeParser parser = new TimeParser();
	long daystokeep = parser.parse('2d');
	Date target = new Date(System.currentTimeMillis() -  daystokeep);
	//-
	
	HitTracker hits = searcher.query().not("editstatus","deleted").after("assetaddeddate", target).search();
	if( hits.size() > 0) {
		hits.enableBulkOperations();
		ArrayList tosave = new ArrayList();
		log.info("Rewrite Metadata. Processing " + hits.size() + " assets");
		hits.each
		{
			Data data = (Data)(it);
	
			Asset entry = searcher.loadData(data);
			writeAsset(mediaarchive,writer,entry);
			
			tosave.add(data);
			if( tosave.size() > 100)
			{
				mediaarchive.saveAssets(tosave);
				log.info("Rewrite Metadata. Saved " + tosave.size() + " assets");
				tosave.clear();
			}
		}
		mediaarchive.saveAssets(tosave);
	}
	else {
		log.info("No assets found: " + hits.friendlyQuery)
	}
}

public void writeAsset(MediaArchive archive,XmpWriter writer, Asset asset)
{
	if( archive.isTagSync(asset.getFileFormat() ) )
		{
			HashMap additionaldetail = new HashMap();
			boolean didSave = writer.saveMetadata(archive, asset, additionaldetail, true);
			if(!didSave){
				log.info("Failed to write metadata for asset " + asset.getId());
			}
		}
	
}

init();
