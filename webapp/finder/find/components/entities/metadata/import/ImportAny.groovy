import org.openedit.Data
import org.openedit.data.Searcher
import org.entermediadb.asset.importer.OnixImporter


//Save to the right source path then use that Page path
String type = context.getRequestParameter("importtype");
if( type == "onix")
{
	OnixImporter oniximporter = new OnixImporter();
	oniximporter.setModuleManager(moduleManager);
	oniximporter.setContext(context);
	oniximporter.setMakeId(false);
	oniximporter.setModule(module);
	oniximporter.setEntity(context.getPageValue("entity"));
	oniximporter.importData();
}