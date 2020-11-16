package asset

import org.entermediadb.asset.*
import org.entermediadb.asset.facedetect.FaceDetectManager
import org.openedit.Data
import org.openedit.hittracker.HitTracker
import org.openedit.util.ExecutorManager
import org.openedit.util.RunningProcess

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	//new Assets
	HitTracker hits = archive.query("asset").exact("facehasprofile",true).exact("facematchcomplete", false).exact("importstatus","complete").search();
	hits.enableBulkOperations();

	log.info("Checking " + hits.size() + " photos");
	//test
//	RunningProcess fieldRunningCompareProcess = new RunningProcess();
//	fieldRunningCompareProcess.setExecutorManager(new ExecutorManager());
//	fieldRunningCompareProcess.start("more", Collections.EMPTY_LIST);
		
	FaceDetectManager manager = archive.getBean("faceDetectManager");
	int found = 0;
	for(Data hit in hits)
	{
		Asset asset = archive.getAsset(hit.getId());//make sure we have fresh profilegroup data
		if( manager.matchFaces(archive, asset) )
		{
			log.info("Got a match on " + asset.getName());
			found++;
		}
	}
	log.info("complete " + found + " matches");
}


init();
