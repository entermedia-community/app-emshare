package entities;

import org.entermediadb.modules.publishing.ContentManager
import org.entermediadb.asset.MediaArchive
import org.openedit.WebPageRequest

public void index()
{
  WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");

  ContentManager contentManager = archive.getBean("contentManager");
  contentManager.indexEntityDocuments(log);
}

index();