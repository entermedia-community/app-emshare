import org.entermediadb.asset.util.CSVWriter
import org.openedit.Data
import org.openedit.data.*
import org.openedit.hittracker.HitTracker
	

HitTracker hits = (HitTracker) context.getPageValue("goalhits");	
if(hits == null){
 String sessionid = context.getRequestParameter("hitssessionid");
 hits = context.getSessionValue(sessionid);
}
hits.enableBulkOperations();
searcherManager = context.getPageValue("searcherManager");
searchtype = context.findValue("searchtype");
catalogid = context.findValue("catalogid");
searcher = searcherManager.getSearcher(catalogid, searchtype);
tasksearcher = searcherManager.getSearcher(catalogid, "goaltask");
commentsearcher = searcherManager.getSearcher(catalogid, "goaltaskcomments");
details = searcher.getPropertyDetails();

//StringWriter output  = new StringWriter();
CSVWriter writer  = new CSVWriter(context.getWriter());
int count = 0;
headers = new String[details.size() + 1];
for (Iterator iterator = details.iterator(); iterator.hasNext();)
{
	PropertyDetail detail = (PropertyDetail) iterator.next();
	headers[count] = detail.getText(context);
	count++;
}
headers[details.size()] = "Tasks";
writer.writeNext(headers);
log.info("about to start: " + hits.size());

for (Iterator iteratorgoal = hits.iterator(); iteratorgoal.hasNext();)
{
	hit =  iteratorgoal.next();
	Data hit = searcher.loadData(hit);  //why do we need to load every record?

	nextrow = new String[details.size() + 1];//make an extra spot for c
	int fieldcount = 0;
	for (Iterator detailiter = details.iterator(); detailiter.hasNext();)
	{
		PropertyDetail detail = (PropertyDetail) detailiter.next();
		String value = hit.get(detail.getId());
		//do special logic here
		if(detail.isList()){
			Data remote  = searcherManager.getData( detail.getListCatalogId(),detail.getListId(), value);
		
				if(remote != null){
				value= remote.getName();
			}
		}
		String render = detail.get("render");
		if(render != null)
		{
			value = searcherManager.getValue(detail.getListCatalogId(), render, hit.getProperties());
		}

		nextrow[fieldcount] = value;
	
		fieldcount++;
	}
	HitTracker tasks = tasksearcher.query().exact("projectgoal", hit.getId()).search();
	writer.writeNext(nextrow);
	StringBuffer out = new StringBuffer();
	for (Iterator iterator = tasks.iterator(); iterator.hasNext();)
	{
		Data task = iterator.next();
		//Save the tasks
		String auser = task.get("completedby");
		if( auser != null)
		{
			out.append( "Task:" + task.getName() + " ");
			out.append( "Completed On:" + task.get("completedon") + " ");
			String userlabel = mediaarchive.getUser(auser).getAnonNickName();
			out.append( "Completed By:" + userlabel + " ");
			out.append("\n");
		}
		/*
		Collection comments = commentsearcher.query().exact("goaltaskid",task.getId()).sort("dateDown").search();
		for (Iterator iterator2 = comments.iterator(); iterator2.hasNext();)
		{
			Data comment = iterator2.next();
			String change = comment.get("statuschange");
			if(change != null) out.append(change + "\n")
			auser = comment.get("author");
			if( auser != null)
			{
				String userlabel = mediaarchive.getUser(auser).getAnonNickName();
				out.append(userlabel + ":");
				out.append( comment.get("commenttext") + "\n" ); 
			}
		}
		*/
	}
	nextrow[details.size()] = out.toString();
	writer.writeNext(nextrow);
	
}
writer.close();

