import org.openedit.Data
import org.openedit.MultiValued
import org.openedit.profile.UserProfile

public void init()
{
	UserProfile userprofile = context.getUserProfile();
	
	String removeallselection = context.getRequestParameter("removeallselection");
	if( removeallselection == "true")
	{
		userprofile.removeAllStartWith("picked");
		return;
	}
	
	String entitytype = context.getRequestParameter("entitytype");
	String addselection = context.getRequestParameter("addselection");
	
	if( addselection == null)
	{
		Data data = context.getPageValue("data"); //saved new one?
		if( data != null)
		{
			addselection = data.getId();
		}
	}
	
	if( addselection != null && entitytype != null)
	{

		userprofile.addValue("picked" + entitytype, addselection);
	}

	String removeselection = context.getRequestParameter("removeselection");
	if( removeselection != null)
	{
		userprofile.removeValue("picked" + entitytype, removeselection);
	}

}


protected String toString(Collection<Data> inValues)
{
	StringBuffer values = new StringBuffer();
	for (Iterator iterator = inValues.iterator(); iterator.hasNext();)
	{
		String detail = (String) iterator.next();
		values.append(detail);
		if (iterator.hasNext())
		{
			values.append(" | ");
		}
	}
	return values.toString();
}

init();



