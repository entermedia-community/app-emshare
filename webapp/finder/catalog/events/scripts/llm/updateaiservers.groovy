import org.entermediadb.ai.llm.LlmConnection
import org.entermediadb.ai.llm.LlmResponse
import org.entermediadb.asset.MediaArchive
import org.entermediadb.net.HttpSharedConnection
import org.json.simple.JSONArray
import org.json.simple.JSONObject
import org.openedit.Data

public void init() {
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	
	LlmConnection connection =  archive.getLlmConnection("getVastInstances");
	LlmResponse response = connection.callJson("/api/v0/instances", null);
	Collection instances = response.getRawResponse().get("instances");
	
	Collection visionservers = new ArrayList();
//	String[] m50v = new String[2];
//	m50v[0] = "https://llamam50vision.entermediadb.net";
//	visionservers.add(m50v);
	
	Collection toolsservers = new ArrayList();
	
	String[] m50t = new String[2];
	m50t[0] = "https://llamam50.entermediadb.net";
	toolsservers.add(m50t);
	
	for (instance in instances) {
		//log.info(instance);
		String ippaddr = "http://" + instance.get("public_ipaddr");
		JSONObject ports = instance.get("ports");
		if (ports != null && instance.get("cur_state").equals("running"))
		{
			//8080/tcp Tools
			//8000/tcp Vision
			JSONArray port_vision = ports.get("8000/tcp");
			String[] found = new String[2]
			if (port_vision != null)
			{
				String port_external = port_vision.get(0).get("HostPort");
				
				found[0] = ippaddr;
				found[1] = port_external;
				
				visionservers.add(found);
			}
			JSONArray port_tools = ports.get("8080/tcp");
			if (port_tools != null)
				{
					String port_external = port_tools.get(0).get("HostPort");
					found[0] = ippaddr;
					found[1] = port_external;
					toolsservers.add(found);
				}
		}
	}
	
	String[] fastestvision = sortbyspeed(visionservers);
	updateServer(fastestvision, "llamaVisionConnection");

	String[] fastesttool = sortbyspeed(toolsservers);
	updateServer(fastesttool, "llamaOpenAiConnection");

}

protected String[] sortbyspeed(Collection<String[]> servers) 
{
	
	Map speeds = new HashMap();
	
	for(String[] server in servers)
	{
		String address = server[0];
		String serverport = server[1];
		if(serverport != null)
		{
			address = address + ":" + serverport;
		}
		HttpSharedConnection connection = new HttpSharedConnection();
		long start = System.currentTimeMillis();
		try
		{
			String got = connection.getResponseString(address);
			if( got != null )
			{
				long end =  System.currentTimeMillis();
				long diff = end - start;
				speeds.put(diff, server);
				log.info(address + " ran in " + diff + " milliseconds");
			}
		}
		catch( Exception ex)
		{
			log.info(address + " had error " + ex);
			//Ignore
		}
	}
	List<Long> speeds = new ArrayList(speeds.keySet());
	speeds.sort(Comparator.naturalOrder());
	
	long lowest = speeds.get(0);
	String[] fast = speeds.get(lowest);
	return fast;
	
}

public void updateServer(String[] fastest, String bean)
{
	MediaArchive archive = context.getPageValue("mediaarchive");
	if (!servers.isEmpty())
	{
		String serverip = fastest[0];
		String serverport = fastest[1];
		//llamaVisionConnection
		ArrayList tosave = new ArrayList();
		Collection<Data> currentservers = archive.query("aiserver").exact("connectionbean", bean).search();
		for (Data server in currentservers) {
			String address = serverip;
			if(serverport != null)
			{
				address = address + ":" + serverport;
			}
			if (!address.equals(server.get("serverroot")))
			{
				server.setValue("serverroot", address);
				tosave.add(server);
				log.info("Server updated: " + server.getName() + " Address:" + address);
			}
		}
		
		if(!tosave.isEmpty())
		{
			archive.getSearcher("aiserver").saveAllData(tosave, null);
			archive.getCacheManager().clear("llmconnection");
		}
	}
}


init();