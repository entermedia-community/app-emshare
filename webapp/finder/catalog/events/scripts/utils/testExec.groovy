import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.openedit.OpenEditException
import org.openedit.repository.ContentItem
import org.openedit.util.Exec
import org.openedit.util.ExecResult



public void init()
{
	MediaArchive mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	
	Asset asset = mediaarchive.getAsset("AZrMMRaJACuEbw7pvHVC");
	
	ContentItem item = mediaarchive.getGeneratedContent(asset, "image3000x3000");
	
	ByteArrayOutputStream output = new ByteArrayOutputStream();
	long starttime = System.currentTimeMillis();
	ArrayList<String> args = new ArrayList<String>();
	args.add(item.getAbsolutePath());
	args.add("-resize");
	args.add("1500x1500>");
	args.add("jpg:-");
	Exec exec = (Exec)mediaarchive.getBean("exec");
	
	ExecResult result = exec.runExecStream("convert", args, output, 5000);
	if (!result.isRunOk())
	{
		throw new OpenEditException("Error converting image");
	}
	long duration = (System.currentTimeMillis() - starttime) ;
	log.info("Converted " + item.getName() + " size: " + output.size() +" in "+duration+"ms");
	
	
	
	starttime = System.currentTimeMillis();
	byte[] bytes = output.toByteArray();  // Read InputStream as bytes
	String base64EncodedString = Base64.getEncoder().encodeToString(bytes); // Encode to Base64
	duration = (System.currentTimeMillis() - starttime) ;
	log.info("Encoded " + item.getName() + " in "+duration+"ms");
	log.info("data:image/jpeg;base64,"+base64EncodedString);
	
}

init();