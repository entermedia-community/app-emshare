import org.entermediadb.ai.llm.LlmConnection
import org.entermediadb.ai.llm.LlmResponse
import org.entermediadb.asset.MediaArchive
import org.entermediadb.net.HttpSharedConnection
import org.json.simple.JSONArray
import org.json.simple.JSONObject
import org.openedit.Data

public void init() {
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	
//	LlmConnection connection =  archive.getLlmConnection("getVastInstances");
//	LlmResponse response = connection.callJson("/api/v0/instances", null);
//	Collection instances = response.getRawResponse().get("instances");

	Collection<Data> currentservers = archive.query("aiserver").exact("monitorspeed", true).search();
	
	Map speeds = new HashMap();
	ArrayList tosave = new ArrayList();
	
	for(Data server in currentservers)
	{
		String serverroot = server.get("serverroot");
		String address = serverroot + "/health";
		
		HttpSharedConnection connection = new HttpSharedConnection();
		String key = server.get("serverapikey");
		if( key != null)
		{
			connection.addSharedHeader("Authorization", "Bearer " +  server);
		}
		long start = System.currentTimeMillis();
		try
		{
			JSONObject got = connection.getJson(address);
			if( got != null )
			{
				String ok = got.get("status");
				if( "ok".equals(ok))
				{
					long end =  System.currentTimeMillis();
					long diff = end - start;
					log.info(address + " ok run in " + diff + " milliseconds");
					server.setValue("ordering", diff);
					tosave.add(server);
				}
			}
		}
		catch( Exception ex)
		{
			log.info(address + " had error " + ex);
			//Ignore
		}
	}
	if(!tosave.isEmpty())
	{
		archive.getSearcher("aiserver").saveAllData(tosave, null);
		archive.getCacheManager().clear("llmconnection");
	}
	
}


init();