package importing

import org.entermediadb.asset.MediaArchive
import org.entermediadb.drupal.DrupalManager

public void init() {
	MediaArchive archive = context.getPageValue("mediaarchive");
	
	//delete all articles first
	archive.getSearcher("article").deleteAll(null);
	
	
	DrupalManager manager = archive.getModuleManager().getBean( "DrupalManager");
	manager.setCatalogId(archive.getCatalogId());
	
	manager.syncContent(context);
	
}

init();