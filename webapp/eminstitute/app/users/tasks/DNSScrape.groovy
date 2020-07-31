@Grapes(
@Grab(group='org.jsoup', module='jsoup', version='1.6.2')
)
import org.jsoup.*
import org.jsoup.nodes.*
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements

public static void main(String[] args) throws Exception {

	//conect to dnschecker with unitednations url
	File input = new File("./input.html");
	Document doc = Jsoup.parse(input, "UTF-8", "https://dnschecker.org/#A/global.unitednations.entermediadb.net");
	/*Document doc = Jsoup.connect("https://dnschecker.org/#A/global.unitednations.entermediadb.net").get();*/
	//retrieve only the 'results' table
	Element results = doc.getElementById("results");
	// get the names of the locations within
	Elements names = results.getElementsByClass("align-middle name");
	System.out.println(results);
	System.out.println(names);
	for (Element name : names) {
		String city = name.text();
		System.out.println(city);
	}
	
	
	
	}