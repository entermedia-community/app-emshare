package importing

import org.entermediadb.asset.MediaArchive
import org.entermediadb.drupal.DrupalManager

public void init() {
	MediaArchive archive = context.getPageValue("mediaarchive");
	
	
	DrupalManager manager = archive.getModuleManager().getBean( "DrupalManager");
	manager.setCatalogId(archive.getCatalogId());
	
	manager.syncContent();
	
}

init();