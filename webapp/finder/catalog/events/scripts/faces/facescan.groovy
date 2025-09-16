package asset

import org.entermediadb.asset.*
import org.entermediadb.asset.facedetect.FaceProfileManager
import org.entermediadb.asset.facedetect.FaceScanInstructions
import org.openedit.MultiValued
import org.openedit.hittracker.HitTracker
import org.openedit.locks.Lock
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Calendar
import org.openedit.data.QueryBuilder

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos
	
	String api = archive.getCatalogSettingValue("faceapikey");
	if(api==null) {
		//No Face API key defined
		log.info("No Face Detect API key defined (faceapikey)");
		return;
	}

	Lock lock = archive.getLockManager().lockIfPossible("facescanning", "admin");
	
	if( lock == null)
	{
		log.info("Faceprofile scanning already in progress");
		return;
	}
	
	int count = 0;

	try
	{	
		QueryBuilder query = archive.localQuery("asset").not("editstatus","7").exact("facescancomplete", "false").exact("previewstatus","2").sort("assetaddeddateDown");
		
		String startdate = archive.getCatalogSettingValue("ai_facescan_startdate");
		
		DateFormat format = new SimpleDateFormat("MM/dd/yyyy", Locale.ENGLISH);
		
		if (startdate == null || startdate.isEmpty())
		{
			Calendar cal = Calendar.getInstance();
			cal.add(Calendar.DAY_OF_YEAR, -30);
			Date thirtyDaysAgo = cal.getTime();
			
			startdate = format.format(thirtyDaysAgo);
		}
		
		Date date = format.parse(startdate);
		
		query.after("assetaddeddate", date);
		HitTracker hits = query.search();
		
		hits.enableBulkOperations();
		List tosave = new ArrayList();
		FaceProfileManager manager = archive.getBean("faceProfileManager");
		
		if (hits.isEmpty())
		{
			log.info("No assets found to scan" + hits);
		}
		if (!hits.isEmpty()) 
		{
			log.info("Checking :" + hits.size());
			
			FaceScanInstructions instructions = manager.createInstructions();
			for(int i=0;i < hits.getTotalPages();i++)
			{
				hits.setPage(i+1);
				long start = System.currentTimeMillis();
				Collection<MultiValued> onepage = hits.getPageOfHits();
				int saved = manager.extractFaces(instructions, onepage);
				count = count + saved;
				if( saved > 0 )
				{
					long end = System.currentTimeMillis();
					long change = end-start;
					double perasset = ((double) change/1000D) /(double)onepage.size();
					
					log.info("face scan processed " + onepage.size() + " assets in " + change + " milliseconds " +  perasset + " asset/second");
				}
			}
			log.info("face scan created: " + count + " faces");
		}
		
	}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
