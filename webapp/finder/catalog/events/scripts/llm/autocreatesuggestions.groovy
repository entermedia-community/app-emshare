package llm

import java.util.*;
import org.openedit.Data;
import org.openedit.WebPageRequest
import org.entermediadb.asset.MediaArchive
import org.entermediadb.ai.ChatMessageHandler;

public void autoCreateSuggestions(){

	WebPageRequest inReq = context;
	MediaArchive archive = context.getPageValue("mediaarchive");
		
	Collection<Data> aifunctions = archive.query("aifunction").exact("toplevel",true).sort("ordering").search();

  for (Iterator iterator = aifunctions.iterator(); iterator.hasNext();)
  {
    Data function = (Data) iterator.next();
    String functionid = function.getId();
    log.info("Creating suggestions for function: " + functionid);
    
    String bean = function.get("messagehandler");
    
    ChatMessageHandler handler = (ChatMessageHandler) archive.getBean( bean);
    
    handler.savePossibleFunctionSuggestions(log);
  }
}

autoCreateSuggestions();
