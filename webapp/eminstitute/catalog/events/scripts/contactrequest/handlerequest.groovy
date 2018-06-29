import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.util.DateStorageUtil

MediaArchive archive = context.getPageValue("mediaarchive");
Searcher contactsearcher = archive.getSearcher("contactrequest");
String[] fields = context.getRequestParameters("field");
Data request = contactsearcher.createNewData();
request.setId(contactsearcher.nextId());
request.setProperty("date", DateStorageUtil.getStorageUtil().formatForStorage(new Date()));
request.setProperty("requeststatus", "pending");
contactsearcher.updateData(context, fields, request); 
contactsearcher.saveData(request, null);
context.putPageValue("data", request)



log.info("request processing...");


