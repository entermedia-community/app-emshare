@Grapes([
@Grab(group='org.jsoup', module='jsoup', version='1.6.2'),
@Grab('net.sourceforge.htmlunit:htmlunit:2.7')
]
)
import com.gargoylesoftware.htmlunit.WebClient;
import org.jsoup.*
import org.jsoup.nodes.*
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements

public static void main(String[] args) throws Exception {

	//conect to dnschecker with unitednations url
	Document doc = Jsoup.connect("https://dnschecker.org/#A/global.unitednations.entermediadb.net").get();
	//retrieve only the 'results' table
	Element results = doc.getElementById("results");
	// get the names of the locations within
	/*Elements names = doc.select("td.align-middle name");*/
	Elements tableRowElements = results.select(":not(thead) tr");
	print(tableRowElements);
	
	for (int i = 0; i < tableRowElements.size(); i++) {
		Element row = tableRowElements.get(i);
		System.out.println("row");
		Elements rowItems = row.select("td");
		for (int j = 0; j < rowItems.size(); j++) {
			System.out.println(rowItems.get(j).text());
			//Do something
			/*if(j != rowItems.size() -1){
				writer.append(',');
			}*/
		}
	}
	/*for (Element name : names) {
		String city = name.text();
		System.out.println(city);
	}*/
	
	
	
	}