package llm;

import org.entermediadb.ai.document.DocumentRagManager
import org.entermediadb.asset.MediaArchive
import org.openedit.WebPageRequest

public void index()
{
  WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");

  DocumentRagManager documentRagManager = archive.getBean("documentRagManager");
  documentRagManager.indexDocumentPages(log);
}

index();