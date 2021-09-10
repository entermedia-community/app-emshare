package importing;

import org.entermediadb.asset.Asset
import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.SearchQuery

import asset.model.AssetTypeManager
import model.assets.LibraryManager




public void init()
{
	WebPageRequest req = context;
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");
	if(hits) {
		//passed hits saved
		hits.each { 
			
		}
		
	}
	


}

init();


