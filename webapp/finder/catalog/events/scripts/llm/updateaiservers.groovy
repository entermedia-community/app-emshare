import org.entermediadb.ai.llm.BasicLlmResponse
import org.entermediadb.ai.llm.LlmConnection
import org.entermediadb.ai.llm.LlmResponse
import org.entermediadb.asset.MediaArchive
import org.json.simple.JSONArray
import org.json.simple.JSONObject
import org.openedit.Data
import org.openedit.MultiValued
import org.openedit.data.QueryBuilder
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

import netscape.javascript.JSObject

public void init() {
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	
	LlmConnection connection =  archive.getLlmConnection("getVastInstances");
	LlmResponse response = connection.callJson("/api/v0/instances", null);
	Collection instances = response.getRawResponse().get("instances");
	
	Collection visionservers = new ArrayList();
	Collection toolsservers = new ArrayList();

	for (instance in instances) {
		//log.info(instance);
		String ippaddr = instance.get("public_ipaddr");
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
	
	
	
	//Todo: Sort servers by performance
	updateServer(visionservers, "llamaVisionConnection");
	updateServer(toolsservers, "llamaOpenAiConnection");

}


public void updateServer(Collection servers, String bean)
{
	MediaArchive archive = context.getPageValue("mediaarchive");
	if (!servers.isEmpty())
	{
		String[] fastest = servers.iterator().next();
		String serverip = fastest[0];
		
		String serverport = fastest[1];
		//llamaVisionConnection
		ArrayList tosave = new ArrayList();
		Collection<Data> currentservers = archive.query("aiserver").exact("connectionbean", bean).search();
		for (Data server in currentservers) {
			String address = "http://" + serverip + ":" + serverport;
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