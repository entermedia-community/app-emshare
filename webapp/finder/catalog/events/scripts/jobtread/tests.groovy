package jobtread

import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.apache.http.client.methods.*
import org.apache.http.entity.StringEntity
import org.entermediadb.ai.llm.VelocityRenderUtil
import org.entermediadb.asset.Asset
import org.entermediadb.asset.Category
import org.entermediadb.asset.CategoryArchive
import org.entermediadb.asset.MediaArchive
import org.entermediadb.net.HttpSharedConnection
import org.entermediadb.projects.LibraryCollection
import org.json.simple.JSONObject
import org.openedit.WebPageRequest
import org.openedit.hittracker.HitTracker


class JobTreadClient {
	private static Log log = LogFactory.getLog(JobTreadClient.class);

	MediaArchive archive
	VelocityRenderUtil render
	HttpSharedConnection connection
	String grantKey
	String orgId

	JobTreadClient(WebPageRequest context, String grantKey, String orgId) {
		this.archive = context.getPageValue("mediaarchive")
		this.render = archive.getBean("velocityRenderUtil")
		this.connection = new HttpSharedConnection()
		this.grantKey = grantKey
		this.orgId = orgId
		context.putPageValue("grantKey", grantKey)
		context.putPageValue("orgid", orgId)
	}

	/**
	 * Return a map of job files keyed by "folder/filename".
	 */
	Map<String, JSONObject> getJobFilesByFolderAndName(WebPageRequest context, String jobId) {
		JSONObject jobJson = listJobFiles(context, jobId)
		JSONObject job = (JSONObject) jobJson.get("job")
		if (job == null) {
			log.warn("No job found for id=${jobId}")
			return [:]
		}

		JSONObject files = (JSONObject) job.get("files")
		if (files == null) {
			return [:]
		}

		def results = [:]
		files.get("nodes")?.each { node ->
			JSONObject file = (JSONObject) node
			String folder = (String) file.get("folder") ?: ""
			String name = (String) file.get("name") ?: ""
			if (name) {
				String key = folder ? "${folder}/${name}" : name
				results[key] = file
			}
		}
		return results
	}

	private JSONObject postQuery(WebPageRequest context, String templatePath) {
		String input = render.loadInputFromTemplate(context, archive.getCatalogId() + templatePath)
		HttpPost method = new HttpPost("https://api.jobtread.com/pave")
		method.setHeader("Content-Type", "application/json")
		method.setEntity(new StringEntity(input, "UTF-8"))
		def resp = connection.sharedExecute(method)
		return connection.parseJson(resp)
	}

	// --- List Accounts/Locations/Jobs (from call.html)
	JSONObject listAccountsAndJobs(WebPageRequest context) {
		return postQuery(context, "/events/jobtread/api/call.html")
	}

	// --- List Files for a Job (from jobfiles.html)
	JSONObject listJobFiles(WebPageRequest context, String jobId) {
		context.putPageValue("jobid", jobId)
		return postQuery(context, "/events/jobtread/api/jobfiles.html")
	}
	// --- Jobs ---
	String createJob(WebPageRequest context, String locationId, String jobName) {
		context.putPageValue("locationId", locationId)
		context.putPageValue("jobName", jobName)
		JSONObject json = postQuery(context, "/events/jobtread/api/create-job.html")
		JSONObject created = (JSONObject) ((JSONObject) json.get("createJob")).get("createdJob")
		return (String) created.get("id")
	}


	// --- Files ---
	String addFileToJob(WebPageRequest context, String jobId, String fileUrl, String fileName, String folder, List<String> tagIds, String description) {
		// Step 1: createUploadRequest
		context.putPageValue("fileUrl", fileUrl)
		JSONObject uploadJson = postQuery(context, "/events/jobtread/api/create-upload-request.html")
		JSONObject createdUpload = (JSONObject) ((JSONObject) uploadJson.get("createUploadRequest")).get("createdUploadRequest")
		String uploadRequestId = (String) createdUpload.get("id")

		// Step 2: createFile
		context.putPageValue("uploadRequestId", uploadRequestId)
		context.putPageValue("jobid", jobId)
		context.putPageValue("fileName", fileName)
		context.putPageValue("folder", folder)
		context.putPageValue("tagIds", tagIds)
		context.putPageValue("description", description)

		JSONObject fileJson = postQuery(context, "/events/jobtread/api/create-file.html")
		JSONObject createdFile = (JSONObject) ((JSONObject) fileJson.get("createFile")).get("createdFile")
		return (String) createdFile.get("id")
	}


	public void listCollections() {
		HitTracker collections = archive.query("librarycollection").all().search();
		collections.forEach { hit	-> log.info(hit) }
	}


	public HitTracker getCollectionAssets(String inCollectionId) {
		LibraryCollection collection = archive.getProjectManager().getLibraryCollection(archive, inCollectionId);
		String catid = collection.getRootCategoryId();
		HitTracker assets = archive.query("asset").exact("category", catid).search();
	}


	public void syncCollection(context,String inCollectionId)	{


		LibraryCollection collection = archive.getProjectManager().getLibraryCollection(archive, inCollectionId);
		String jobid = "22PHDVWGEiqV"
		//String jobid = createJob(context, "22Nz4MrPihDJ", collection.getName().substring(0,30));
		log.info(jobid); //22PHDTQWGgwe
		Map<String, JSONObject> files = getJobFilesByFolderAndName(context, "22PHDVWGEiqV")

		HitTracker allassets = getCollectionAssets(inCollectionId);
		allassets.forEach { hit	->
			log.info(hit)
			String link = archive.asLinkToOriginal(hit);
			Asset real = archive.getAsset(hit.id);
			Category cat = real.getDefaultCategory();
			String key = "${cat.name}/${hit.name}";
			if(!files.containsKey(key)) {
				String siteroot = "https://op.entermediadb.net"
				String mediadb = archive.getMediaDbId()
				String url = "${siteroot}/${mediadb}/services/module/asset/downloads/originals/${link}"
				log.info(url);

				addFileToJob(context, jobid,url, hit.name, cat.getName(),[], hit.name)
			} else {
				log.info("Skipping alreday present file: " + key)
			}
			return;
		}
	}
}

def client = new JobTreadClient(context, "22T73hEv4tyPusYzC8t4BsX4VrtXEHk226", "22NuiAZ6XXvS")
String collectionid = "AYBmm55bbHTS-pTbIfVU";

client.syncCollection(context,collectionid);


//client.listJobFiles(context, "22PHDVWGEiqV")

//// 1. Fetch accounts + jobs
//JSONObject tree = client.listAccountsAndJobs(context)
//log.info("Accounts + Jobs: " + tree.toJSONString())
//
//
//String jobId = "22PHDKELgN2j";// client.createJob(context, "22Nz4MrPihDJ", "Migration Test Job")
//log.info("Created Job under account 22Nz4Lg9QaFB: " + jobId)
//
//String fileId = client.addFileToJob(
//		context,
//		jobId,
//		"https://thoughtframe.ai/thoughtframe/theme/images/toplogo.png",
//		"top_logo.pngf",
//		"01_Documents",
//		[],
//		"Imported test file"
//		)
//log.info("Attached File: " + fileId)
//
//
//
//
//
