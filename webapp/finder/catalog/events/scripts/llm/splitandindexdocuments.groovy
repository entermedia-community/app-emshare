package llm;

import org.entermediadb.modules.publishing.ContentModule
import org.entermediadb.asset.MediaArchive
import org.openedit.WebPageRequest

public void index()
{
  WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");

  ContentModule contentModule = (ContentModule) archive.getBean("ContentModule");
  contentModule.splitAllEntityDocuments(log);
}

index();