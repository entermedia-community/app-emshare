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
	
	String foundcategory = "AYyDQU31oRsY97PbIb-R"; //Category containing recovered assets
	
	Collection foundassets = mediaarchive.query("asset").match("category", foundcategory).search();
	if( foundassets.size() >= 1) {
		for(Data asset in foundassets)
		{
			String foundmd5 = asset.getValue("md5hex");
			Collection duplicatedhits = mediaarchive.query("asset").match("md5hex", foundmd5).not("id", asset.getId()).search();
			log.info("Found:"+duplicatedhits.size())
			if( duplicatedhits.size() >= 1)
			{
				for(Data asset2 in duplicatedhits)
				{
					ContentItem	 fullpath = 	mediaarchive.getOriginalContent(asset2);
	
					if(fullpath.getLength() == 138){
						
						log.info("Found: "+fullpath + " : " + (String) fullpath.getLength());
						Page originalpath = pageManager.getPage("/WEB-INF/data/" + mediaarchive.getCatalogId() + "/originals/" + asset2.getSourcePath() );
						
						//backup corrupted, for what?
						Page newpage = pageManager.getPage("/WEB-INF/data/" + mediaarchive.getCatalogId() + "/originals/_corrupted/" + asset2.getSourcePath());
						pageManager.movePage(originalpath, newpage);
						
						//bring restored file
						Page restoredpage = pageManager.getPage("/WEB-INF/data/" + mediaarchive.getCatalogId() + "/originals/" + asset.getSourcePath());
						pageManager.movePage(restoredpage, originalpath);
						
						//delete restored asset?
						//mediaarchive.deleteAsset(asset,false);
					}
					
							
					
				}
			}
		}
	}
	

		
}

//clearDuplicateFlag();
init();
