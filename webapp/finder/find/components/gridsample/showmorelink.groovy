import org.json.simple.JSONArray
import org.json.simple.JSONObject
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.SearchQuery
import org.openedit.hittracker.Term
import org.openedit.util.DateStorageUtil

public void init()
{
	HitTracker hits = context.getPageValue("hits");
	
	if( hits == null)
	{
		return null;  //should never happen
	}

	SearchQuery query = hits.getSearchQuery();
	Collection terms = hits.getFilteredTerms(context,"advancedfilter");

	JSONObject json = new JSONObject();
	
	JSONArray array = new JSONArray();
	json.put("fields",array);
		log.info("Has main: "  + hits.getSearchQuery().hasMainInput());
	if( hits.getSearchQuery().hasMainInput())
	{
		String desc = hits.getSearchQuery().getMainInput();
		JSONObject field = new JSONObject();
		field.put("name", "description");
		field.put("operation", "freeform");
		field.put("value", desc);
		array.add(field);
	}
	for( Term term in terms)
	{
		boolean addfield = term.isUserFilter(); 
		if( term.getDetail().getId() == "id")
		{
			addfield = false;
		}
		if( term.getDetail().isDate())
		{
			addfield = true;
		}

		if( addfield)
		{
			JSONObject field = new JSONObject();
			field.put("name", term.getDetail().getId());
			field.put("operation", term.getOperation());
			if( term.getValue() != null)
			{
				field.put("value", term.getValue());
			}
			if( term.getValues() != null)
			{
				field.put("values", Arrays.asList(term.getValues()));
			}
			if( term.getDetail().isDate() )
			{
				Date before = term.getValue("beforeDate");
				if( before != null)
				{
					field.put("beforeDate",DateStorageUtil.getStorageUtil().formatForStorage(before));
				}
				Date after = term.getValue("afterDate");
				if( after != null)
				{
					field.put("afterDate",DateStorageUtil.getStorageUtil().formatForStorage(after));
				}
			}
			//ibmsdl_date.after
			
			array.add(field);
		}
	}	
	context.putPageValue("jsonsearch",json.toString());
}

init();



