package importing

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.scanner.MetaDataReader
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.repository.ContentItem

import groovy.util.logging.Log

public void init()
{
		MediaArchive archive = context.getPageValue("mediaarchive");
		Searcher searcher = archive.getAssetSearcher();
		Integer pagesize = 200;
		
		HitTracker assets = searcher.query().exact("tempeditstatus","needsmetadata").sort("id").search();
		assets.enableBulkOperations();
		assets.setHitsPerPage(pagesize);
		String ids = context.getRequestParameter("assetids");
		if( ids != null )
		{
			String[] assetids = ids.split(",");
			assets.setSelections(Arrays.asList( assetids) );
			assets.setShowOnlySelected(true);
		}

		List assetsToSave = new ArrayList();
		MetaDataReader reader = moduleManager.getBean("metaDataReader");
		log.info("metadatareader assets to read: " + assets.size());
		Integer count = 0;
		for (Data hit in assets)
		{
			log.info("metadatareader loading asset: ${hit.id}");
			Asset asset = searcher.loadData(hit);
			if( asset != null)
			{
				count = count +1;
				ContentItem content = archive.getOriginalContent( asset );
				log.info("metadatareader asset (${count}) content ${hit.id}: " + content.toString());
				reader.populateAsset(archive, content, asset);
				log.info("metadatareader asset populated ${hit.id}");
				
				asset.setValue("tempeditstatus", "");
				
				assetsToSave.add(asset);
				if(assetsToSave.size() == pagesize)
				{
					log.info("metadatareader about to save 300 assets");
					archive.saveAssets( assetsToSave );
					log.info("metadatareader saved "+pagesize+" assets");
					assetsToSave.clear();
					count = 0;
				}
			}
			else
			{
				log.info("metadatareader error loading asset: ${hit.id}");
			}
		}
		archive.saveAssets(assetsToSave);
		log.info("metadatareader reading complete");
}

init();