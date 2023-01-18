
import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.graalvm.compiler.debug.PathUtilities
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.util.PathUtilities

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	String id = context.getRequestParameter("id");
			
	
	Searcher searcher = archive.getSearcher("userupload");
	Data data = searcher.searchById(id);

	String field = "reportedby";
	
	Collection all = data.getValues(field);
	if( all == null)
	{
		all = new ArrayList();
	}
	all = new HashSet(all);
	String toadd = context.getRequestParameter(field + ".add");
	if( toadd != null)
	{
		all.add(toadd);
	}
	String toremove = context.getRequestParameter(field + ".remove");
	if( toremove != null)
	{
		all.remove(toremove);
	}
	data.setValue(field,all);
	
	searcher.saveData(data);
		
	context.putPageValue("data",data);
	context.putPageValue("searcher",searcher);
	
}

init();


