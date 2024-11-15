import org.openedit.*

import org.openedit.OpenEditException
import org.openedit.hittracker.*


public String readLastLines( String fileName , long chars) {
	try {
		java.io.File file = new java.io.File( fileName );
		if( !file.exists())
		{
			return fileName + " not found. Please edit catalogsettings server_log_location";
		}
		java.io.RandomAccessFile fileHandler = new java.io.RandomAccessFile( file, "r" );
		long fileLength = file.length();
		
		// 100 1000
		long max = Math.min(fileLength, chars); //100
		
		StringBuilder sb = new StringBuilder();
		long start = fileLength - max;
		fileHandler.seek( start );
		Byte readByte = 0;
		// log.info( "Reading ${start} ${fileLength} ${max}"); //Casuing Infinity Loop
		for(long i = 0;i < max;i++)
		{
		   readByte = fileHandler.readByte();
		   sb.append( ( char ) readByte );
		}
		return sb.toString();
	} catch( Exception e ) 
	{
		e.printStackTrace();
		throw new OpenEditException(e);
	}
}

public void init()
{
	//"/opt/entermedia/opt/apache-tomcat/logs/catalina.log"
	String location = mediaarchive.getCatalogSettingValue("server_log_location");
	String  logs = 	readLastLines( location, 10000);
	context.putPageValue("logs",logs);
}

init();