package data

import java.time.*;

import org.entermedia.insights.search.DiscoverySearcher
import org.entermediadb.asset.ChunkySourcePathCreator
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.PropertyDetail
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.repository.ContentItem
import org.openedit.repository.filesystem.FileItem
import org.openedit.util.DateStorageUtil
import org.openedit.util.OutputFiller
import org.openedit.util.PathUtilities


public String findTableName(Data jsonHit) 
{
	String sourceType = jsonHit.get("sdl_source_type");

	switch (sourceType) 
	{
		case "PRC": 			return "insight_domain_poc";			// PRC > Domain POCs
		case "PWS": 			return "insight_contract";				// PWS > Contract Performance Work Statements
		case "MIP Projects": 	return "insight_project_mip"; 			// MIP Projects > MIP Research Projects
		case "MVC": 			return "insight_project_mvc";			// MVC > Direct Projects
		case "MPL": 			return "insight_product_mpl";			// MPL > MITRE Product Library Products
		case "tcas": 			return "insight_capability";			// tcas > Capabilities
		case "platform": 		return "insight_platform";				// platforms > Platforms
		default:
			log.debug("Not tracking source type: " + sourceType);
			return null;							// no source or unwanted
	}
}

public String findRealField(String fieldName, Data hit) 
{
	String sourceType = hit.get("sdl_source_type");
	if (sourceType != null) 
	{
		switch (sourceType) 
		{
			case "PRC":							// PRC > Future swim lane?
				switch (fieldName) {
					case "title": 					return "title"; // docName (not anymore?)
					case "text": 					return "text";
				}
			case "PWS":							// PWS > Contract Performance Work Statements
				switch(fieldName) 
				{
					case "title": 					return "title";
					case "text": 					return "text";
				}
			case "MIP Projects":				// PWS > Contract Performance Work Statements
				switch(fieldName) 
				{
					case "title": 					return "name";
					case "text": 					return "text";
				}
			case "MVC": 						// MVC > Direct Projects
				switch(fieldName) 
				{
					case "title": 					return "project_name";
					case "text": 					return "text";				//TBD
				}
			case "MPL": 			 			// MPL > MITRE Product Library Products
				switch (fieldName) 
				{
					case "title": 					return "productName";
					case "text": 					return "text";
				}
			case "tcas": 						// Capabilities tcas / insight_capability
				switch (fieldName) 
				{
					case "title": 					return "field_tca_short_name"; // specialCases
					case "text": 					return "text";
				}
			case "platforms": 					// platforms > Platforms
				switch (fieldName) 
				{
					case "title": 					return "title";
					case "text": 					return "text";
				}
		}
	}
	return fieldName;
}
//TODO: Make it smarter

public String specialCases(String fieldName, Data hit) 
{
	String sourceType = hit.get("sdl_source_type");
	switch (sourceType) 
	{
		case "MIP Projects": 				// MIP Projects > MIP Research Projects
			switch(fieldName) 
			{
				case "title":
				String chargeCode = hit.getValue("chargeCode");
				String longName = hit.getValue("longName");
				return (chargeCode != null ? chargeCode + ' ' : '') + (longName != null ? longName : '');
			}
		case "PWS": 						//PWS / insight_contract
			switch(fieldName) 
			{
				case "title":
				String sourceLibrary = hit.getValue("source_library");
				String fileName = PathUtilities.extractFileName(hit.getValue("file_name")); // TODO: remove file.ext
				// log.info("TCAS: " + sourceLibrary + ' ' + fileName)
				return (sourceLibrary != null ? sourceLibrary + ' ' : '') + (fileName != null? fileName : '');
			}
	}
	return null;
}


public void init() {	
	MediaArchive mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	DiscoverySearcher discovery = mediaarchive.getSearcher("discovery");
	discovery.initialize();
	
	String discStartYear = mediaarchive.getCatalogSettingValue("discovery_start_year");
	String discEndYear = mediaarchive.getCatalogSettingValue("discovery_end_year");	
	int startYear = discStartYear != null ? Integer.parseInt(discStartYear) : 2020; // TODO: current year
	int endYear = discEndYear != null ? Integer.parseInt(discEndYear) : 2020;;
	
	if (endYear < startYear) 
	{
		log.info("Invalid Date setup from: " + startYear + " to: " + endYear);
		return;
	}
	
	//Check
	String[] tables =  ["insight_domain_poc","insight_contract","insight_project_mip","insight_project_mvc","insight_product_mpl","insight_capability","insight_platform"];
	
	log.info("clearing tables");
	for (var in tables)
	{
		Searcher searcher = mediaarchive.getSearcher(var);
		searcher.deleteAll(null);
	}
	log.info("loading data");

	
	LocalDate currentDate = LocalDate.now();
	// HitTracker all = mediaarchive.query("discovery").match("ibmupdated_at",startYear.toString()).search();
	int currentYear = currentDate.getYear();
	int recordCounter = 0;
	for (int i = startYear; i <= endYear; i++) 
	{
		log.info("Pulling Year: " + i.toString());
		for (int j = 1; j <= 12; j++) 
		{
			HitTracker all = mediaarchive.query("discovery").match("year", i.toString()).match("month", j.toString())
					.match("count","10000").search();
			if (all != null) 
			{
				recordCounter += all.size();
				saveDiscoveryData(all, j);
			} 
			else 
			{
				log.info("GET failed")
			}
		}
	}
	log.info("Saved " + recordCounter + " Records");
}

public Data saveToList(String tableName, Object value) 
{
	MediaArchive mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	String id = PathUtilities.extractId(value.toString());
	Data data = mediaarchive.getCachedData(tableName, id);
	if (data == null) 
	{
		data = mediaarchive.getSearcher(tableName).createNewData();
		data.setId(id);
		data.setName(value.toString());
		mediaarchive.saveData(tableName, data);
	}
	return data;
}

public Collection SaveAllValues(Collection entities, String filterType, String colName) 
{
	Collection toSave = new ArrayList();
	for (entity in entities) 
	{
		String entityType = entity.get("type");
		if (entityType.equals(filterType)) 
		{
//			Map disambiguation = entity.get("disambiguation");
//			if (disambiguation != null) 
//			{
//				String label = disambiguation != null ?  disambiguation.get("name") : entity.get("name");
//				Data data = saveToList(colName, label);
//				toSave.add(data);
//			}
			String label = entity.get("text");
			Data data = saveToList(colName, label);
			toSave.add(data);
		}
	}
	return toSave;
}

public HitTracker saveDiscoveryData(HitTracker all, int month)
{
	Map toSaveByType = new HashMap();

	ChunkySourcePathCreator sourcepathcreator = new ChunkySourcePathCreator(3);

	for (hit in all)
	{
		String tableName = findTableName(hit);
		if( tableName == null)
		{
			continue;
		}
		Searcher searcher = mediaarchive.getSearcher(tableName);

		List tosave = toSaveByType.get(tableName);
		if (tosave == null)
		{
			tosave = new ArrayList();
			toSaveByType.put(tableName, tosave);
		}
		Data data = searcher.createNewData();
		
		String sdlid = hit.get("sdl_id");
		data.setId(sdlid);
		String sourcepath = sourcepathcreator.createSourcePath(data, sdlid);
		data.setSourcePath(sourcepath);

		for (PropertyDetail detail in searcher.getPropertyDetails() )
		{
			String col = detail.getId();
			Object obj  = null;
			if( col.equals("id") || col.equals("ibmtext")) 
			{
				continue;
			}
			else if (col.startsWith("ibm")) 
			{
				col = col.substring(3);
			} 
			
			//Special cases
			if (col.equals("filename")) 
			{
				Map extractedMetadata = hit.getValue("extracted_metadata");
				if (extractedMetadata != null) {
					obj = extractedMetadata.get("filename");
				}
			} else if (col.equals("sdl_date")) {
				String dateString = hit.getValue("sdl_date");
				Date date = DateStorageUtil.getStorageUtil().parseFromStorage(dateString);
				obj = date;
			} else if (col.equals("sdl_source_type")) {
				obj = tableName;
			} 
			else if (detail.getId().equals("fulltext"))
			{
				obj = saveFullText(data,hit,tableName);
			} 
			else if (col.equals("uid")) 
			{
				obj = tableName + "_" + sdlid;
			} 
//			else if (col.equals("keywords"))
//			{
//			    obj = hit.getValue("declaredTags");
//			}			
			else {
				obj = checkIfWatsonStuff(data,hit,col,detail);				
			}
			
			if (obj == null && detail.getId().startsWith("ibm"))
			{
				// this will overwrite the current obj with known fieldfields
				String realField = findRealField(col, hit); // returns field name
				if (realField != null) {
					String realFieldValue =  hit.getValue(realField);
					String specialCase = specialCases(col, hit); // returns value
					obj = specialCase != null ? specialCase : realFieldValue;
					if (obj == null)
					{
						//log.info("Found empty value for table: " + tableName + "id: " + sdlid + " field: " + realField);
						//obj = hit.getValue("sdl_id");
					}
				}
			}
			
			if (detail.getId() == "ibmtitle" && obj == null) {
				log.info("ERROR: missing title inside: "+ tableName + " id: " + sdlid );
			}

			if (obj != null ) 
			{
				if ( col.equals("fundingSource")) 
				{
					obj = saveToList("ibmfundingSource",obj);
				} 
				else if (col.equals("level1")) 
				{
					obj = saveToList("ibmlevel1", obj);
				}
				
				data.setValue(detail.getId(),obj);
				//log.info("saving " + detail.getId() + " + " + obj);
											
			}
		}

		tosave.add(data);
		if( tosave.size() > 1000)
		{
			log.info("Month: " + month + ", Saved: " + tosave + " records, Table: " + tableName);
			searcher.saveAllData(tosave, null);
			tosave.clear();
		}
	}
	for ( String tableName in toSaveByType.keySet())
	{
		Searcher searcher = mediaarchive.getSearcher(tableName);
		List tosave = toSaveByType.get(tableName);
		searcher.saveAllData(tosave, null);
		log.info("Month: " + month + ", Saved: " + tosave.size() + " records, Table: " + tableName);
	}
}

public String saveFullText(Data data, Data hit, String tableName)
{
	String fulltext = hit.get("text");
	if( fulltext != null && fulltext.length() > 0)
	{
		ContentItem item = mediaarchive.getPageManager().getRepository().getStub("/WEB-INF/data/" + mediaarchive.getCatalogId() + "/" + tableName + "/" + data.getSourcePath() + "/fulltext.txt");
		if( item instanceof FileItem)
		{
			((FileItem)item).getFile().getParentFile().mkdirs();
		}
		PrintWriter output = new PrintWriter(item.getOutputStream());
		OutputFiller filler = new OutputFiller();
		filler.setMaxSize(3000);
		filler.fill(new StringReader(fulltext), output );
		filler.close(output);
		data.setProperty("hasfulltext", "true");
	}
}

public Object checkIfWatsonStuff(Data data, Data hit,String col, PropertyDetail detail)
{
	Object obj = null;
	Map enrichedText = hit.getValue("enriched_text");
	if (enrichedText == null) 
	{
		return obj;
	}

	switch (col) {
		case "trackedtopics":
			Collection concepts = enrichedText.get("concepts");
			if (concepts != null) 
			{
				List<Data> conceptsToSave = new ArrayList();
				for (concept in concepts) 
				{
					String textConcept = concept.get("text");
					Data topic = saveToList("trackedtopics", textConcept);
					conceptsToSave.add(topic);
				}
				obj = conceptsToSave;
			}
			break;
		case "keywords": 
			Collection keywords = enrichedText.get("keywords");
			if (keywords != null) 
			{
				// List<Data> keywordsToSave = new ArrayList();
				String keywordsObj = "";
				int i = 0;
				for (keyword in keywords)
				{
					String textKeywords = keyword.get("text");
					keywordsObj += i == 0 ? textKeywords : "|" + textKeywords;
					i++;	
				}
				obj = keywordsObj;
			}
			break;
		
	}
	Collection entities = enrichedText.get("entities");
	if (entities != null) 
	{
		switch (col) 
		{
			case "entitycompany": 			obj = SaveAllValues(entities, "Company", detail.getId()); break;
			case "entitypeople": 			obj = SaveAllValues(entities, "People", detail.getId()); break;
			case "entityorganization": 		obj = SaveAllValues(entities, "Organization", detail.getId()); break;
			case "entityfacility": 			obj = SaveAllValues(entities, "Facility", detail.getId()); break;
			case "entitygeographicfeature": obj = SaveAllValues(entities, "GeographicFeature", detail.getId()); break;
			case "entityhealthcondition": 	obj = SaveAllValues(entities, "HealthCondition", detail.getId()); break;
			case "entitylocation":			obj = SaveAllValues(entities, "Location", detail.getId()); break;
			case "entityperson":			obj = SaveAllValues(entities, "Person", detail.getId()); break;
			case "entityprintmedia": 		obj = SaveAllValues(entities, "PrintMedia", detail.getId()); break;
			case "entityquantity": 			obj = SaveAllValues(entities, "Quantity", detail.getId()); break;
			case "entitysport": 			obj = SaveAllValues(entities, "Sport", detail.getId()); break;
			case "entitybroadcaster": 		obj = SaveAllValues(entities, "Broadcaster", detail.getId()); break;
			case "entitycrime": 			obj = SaveAllValues(entities, "Crime", detail.getId()); break;
			case "entitydrug": 				obj = SaveAllValues(entities, "Drug", detail.getId()); break;
			case "entityemailaddress": 		obj = SaveAllValues(entities, "EmailAddress", detail.getId()); break;
			case "entityhashtag": 			obj = SaveAllValues(entities, "Hashtag", detail.getId()); break;
			case "entityipaddress": 		obj = SaveAllValues(entities, "IPAddress", detail.getId()); break;
			case "entityjobtitle": 			obj = SaveAllValues(entities, "JobTitle", detail.getId()); break;
		}
	}
	return obj;
}

init();
log.info("Complete");
