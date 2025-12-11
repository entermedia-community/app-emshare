import org.entermediadb.asset.MediaArchive
import org.entermediadb.net.HttpSharedConnection
import org.json.simple.JSONObject
import org.openedit.Data
import org.openedit.MultiValued

public void init() {
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	
//	LlmConnection connection =  archive.getLlmConnection("getVastInstances");
//	LlmResponse response = connection.callJson("/api/v0/instances", null);
//	Collection instances = response.getRawResponse().get("instances");

	Collection<Data> currentservers = archive.query("aiserver").exact("autoordering", true).exact("autoenable", true).or().search();
	
	Map<String,Long> speeds = new HashMap();
	ArrayList tosave = new ArrayList();
	
	for(Data server in currentservers)
	{
		String serverroot = server.get("serverroot");
		String address = serverroot + "/health";
		
		Long speed = speeds.get(serverroot);
		if( speed == null || speed == 0)
		{
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
						speeds.put(serverroot,diff);
					}
				}
			}
			catch( Exception ex)
			{
				log.info(address + " had error " + ex);
				speeds.put(serverroot,Integer.MAX_VALUE); //Push back
				//Ignore
			}
		}
	}
	if(!speeds.isEmpty())
	{
		for(MultiValued server in currentservers)
		{
			String serverroot = server.get("serverroot");
			Long speed = speeds.get(serverroot);
			
			if( server.getBoolean("autoordering") )
			{
				server.setValue("ordering", speed);
			}
			if( server.getBoolean("autoenable") )
			{
				if( speed > 10000) //Probably an error
				{
					server.setValue("enabled", false);
				}
				else
				{
					server.setValue("enabled", true);
				}
			}
	
			tosave.add(server);
		}
		archive.getSearcher("aiserver").saveAllData(tosave, null);
		archive.getCacheManager().clear("llmconnection");
	}
	
}


init();