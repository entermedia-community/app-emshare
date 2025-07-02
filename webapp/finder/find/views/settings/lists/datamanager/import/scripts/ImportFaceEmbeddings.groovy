import org.entermediadb.asset.importer.BaseImporter
import org.entermediadb.asset.util.Row
import org.json.simple.JSONArray
import org.json.simple.parser.JSONParser
import org.openedit.Data

class CsvImporter extends BaseImporter
{
	/**
	 * This is an example of making a field lower case
	 */
	
	JSONParser fieldParser = new JSONParser();
	
	protected void addProperties( Row inRow, Data inData)
	{
		//super.addProperties( inRow, inData);
		
		String filename = inRow.get("assetid");
		
		Searcher assetlookup = getSearcher().getSearcherManager().getSearcher("asset");
		Data asset  = assetlookup.query().exact("name",filename).searchOne();
		if( asset != null) 
		{
			inData.setValue("assetid",asset.getId());
		}

		String doubles = inRow.get("facedatadoubles");
		JSONArray array = fieldParser.parse(doubles);
		Collection doubles = collectDoubles(array);
		
		inData.setValue("facedatadoubles",doubles);
	}

	protected List<Double> collectDoubles(Collection vector)
	{
		List<Double> floats = new ArrayList(vector.size());
		for (Iterator iterator = vector.iterator(); iterator.hasNext();)
		{
			Object floatobj = iterator.next();
			double f;
			if( floatobj instanceof Double)
			{
				f = (Double)floatobj;
			}
			else
			{
				f = Double.parseDouble(floatobj.toString());
			}
			floats.add(f);
		}
		return floats;
	}
	
}


CsvImporter csvimporter = new CsvImporter();
csvimporter.setModuleManager(moduleManager);
csvimporter.setContext(context);
csvimporter.setLog(log);
csvimporter.setMakeId(false);
csvimporter.importData();
