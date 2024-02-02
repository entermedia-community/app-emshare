package asset;



import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.search.AssetSearcher
import org.openedit.Data
import org.openedit.repository.*
import org.openedit.page.Page
import org.openedit.page.manage.PageManager




public void init()
{

	MediaArchive archive = context.getPageValue("mediaarchive");
	AssetSearcher searcher = mediaarchive.getAssetSearcher();
	
	String foundcategory = "AYvVBzbT4bwaYKlXOfJN"; //Category containing recovered assets
	
	Collection foundassets = mediaarchive.query("asset").match("category", foundcategory).search();
	
		for(Data asset in foundassets)
		{
			String foundmd5 = asset.getValue("md5hex");
			Collection duplicatedhits = mediaarchive.query("asset").match("md5hex", foundmd5).not("id", asset.getId()).search();
			log.info("Found:"+duplicatedhits.size())
			if( duplicatedhits.size() >= 1)
			{
				for(Data asset2 in duplicatedhits)
				{
					ContentItem	destinationfullpath = 	mediaarchive.getOriginalContent(asset2);
	
					if(destinationfullpath.getLength() == 138){
						
						log.info("Found: "+destinationfullpath + " : " + (String) destinationfullpath.getLength());
						
						ContentItem	sourcefullpath = 	mediaarchive.getOriginalContent(asset);
						
						pageManager.getRepository().remove(destinationfullpath);
						pageManager.getRepository().copy(sourcefullpath, destinationfullpath);
						
						
						//delete restored asset?
						//mediaarchive.deleteAsset(asset,false);
					}
					
							
					
				}
			}
		
	}
	

		
}

//clearDuplicateFlag();
init();
