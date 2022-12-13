package asset

import org.entermediadb.asset.Asset
import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.util.TimeParser
import org.openedit.Data
import org.openedit.data.QueryBuilder
import org.openedit.hittracker.HitTracker
import org.openedit.page.Page
import org.openedit.page.manage.PageManager


import org.json.simple.JSONArray;
import org.json.simple.JSONObject;



public void init()
{
	MediaArchive mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	PageManager pageManager = mediaarchive.getPageManager();
	//Search assets not tagged and importstatus complete
	QueryBuilder query = mediaarchive.getAssetSearcher().query().all();

	Collection cats = new HashSet();
	Collection found = mediaarchive.query("librarycollection").exact("id","AWdWjGB-jfmjX-d6rRXB").search();
	for(Data col in found)
	{
		Category cat = mediaarchive.getCategory(col.get("rootcategory"));
		if( cat != null)
		{
			cats.add(cat);
		}
	}
	query.orgroup("category", cats);
	
	HitTracker hits = query.search();
	Integer assetcount = 0;
	if (hits.size() > 1) {
		log.info(hits.size()+" assets to be copied:"  + query);
		
		
		List tosave = new ArrayList();
		hits.each {
			Data hit = it;
			Asset asset = mediaarchive.getAsset(it.id);
			if(asset) {
				Page fullpath = pageManager.getPage("/WEB-INF/data/" + mediaarchive.getCatalogId() + "/originals/" + asset.getSourcePath() );
				if(fullpath.exists()){
					String newsourcepath =  asset.getSourcePath();
					Page destpage = pageManager.getPage("/WEB-INF/data/" + mediaarchive.getCatalogId() + "/Archive_Collection/" + newsourcepath);
					pageManager.copyPage(fullpath,destpage);
					log.info("Asset copied to ${destpage.getContentItem().getAbsolutePath()}");
					assetcount = assetcount +1;
				}
				else
				{
					log.info("could not copy: ${asset.getSourcePath()}");
				}
			}
		}
	}
	log.info(assetcount +" assets copied");
}	

public boolean isEmpty( Page inParentFolder)
{
	boolean hasstuff = false;
	Collection children = pageManager.getChildrenPaths(inParentFolder.getPath(),true);
	for (Iterator iterator = children.iterator(); iterator.hasNext();)
	{
		String childfolder =  iterator.next();
		
		Page node = pageManager.getPage(childfolder);
		if( !node.isFolder() )
		{
			hasstuff = true;
		}
		else if(!isEmpty(node))
		{
			hasstuff = true;
		}
	}
	if( !hasstuff )
	{
		log.info("trim " + inParentFolder);
		pageManager.removePage(inParentFolder);
		return true;
	}
	return false;
}




init();
