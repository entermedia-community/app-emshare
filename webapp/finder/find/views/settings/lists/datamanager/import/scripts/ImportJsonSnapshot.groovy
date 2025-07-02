import org.elasticsearch.action.bulk.BulkProcessor
import org.elasticsearch.action.index.IndexRequest
import org.elasticsearch.client.Requests
import org.entermediadb.asset.importer.*
import org.entermediadb.elasticsearch.ElasticNodeManager
import org.json.simple.JSONObject
import org.json.simple.parser.JSONParser
import org.openedit.data.BaseData
import org.openedit.data.Searcher
import org.openedit.page.Page

import groovy.json.JsonSlurper

class JsonImportSnapshot extends BaseImporter
{
	protected Map<String,String> fieldLookUps;
	protected Searcher fieldSearcher;
	protected boolean fieldMakeId;
	
	public Searcher getSearcher()
	{
		return fieldSearcher;
	}
	public void importData() throws Exception
	{
		fieldSearcher = loadSearcher(context);
		
		String importpath = context.findValue("importpath");
		Page upload = getPageManager().getPage(importpath);
		
		Reader reader = upload.getReader();
		try
		{
			importJson(reader);
		}
		finally
		{
			reader.close();
		}	   
	}
	protected void importJson(Reader inStream)
	{
		Map all = new HashMap();
		JSONParser parser = new JSONParser();
		Map parent = parser.parse(inStream);

		String searchtype = parent.keySet().iterator().next();
		List records = parent.get(searchtype);
		List tosave = new ArrayList();
		ElasticNodeManager manager = (ElasticNodeManager)getMediaArchive().getNodeManager();
		String index = manager.toId(getMediaArchive().getCatalogId());
		getLog().info("Saving to " + index + " type " + getSearcher().getSearchType());
		BulkProcessor processor = manager.getBulkProcessor();
		for(Map node in records)
		{
			IndexRequest req = Requests.indexRequest(index).type(getSearcher().getSearchType());
			String id = node.get("_id");
			if( id == null)
			{
				throw new RuntimeException("No Id");
			}
			else
			{
				req.id(id);
			}
			JSONObject source = node.get("_source");
			String json  = source.toJSONString();
			req.source(json);
			getLog().info("Saving: " + json);
			processor.add(req);
		}
		manager.flushBulk();
		getSearcher().clearIndex();
	}
}

//Datamanager
JsonImportSnapshot importer = new JsonImportSnapshot();
importer.setModuleManager(moduleManager);
importer.setContext(context);
importer.setLog(log);
importer.importData();
