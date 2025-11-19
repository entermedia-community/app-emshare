import java.security.MessageDigest

import org.entermediadb.asset.importer.BaseImporter
import org.entermediadb.asset.util.Header
import org.entermediadb.asset.util.Row
import org.openedit.Data
import org.openedit.data.PropertyDetail
import org.openedit.util.FileUtils

import groovy.json.JsonSlurper

class JsonlImporter extends BaseImporter {

    @Override
    void importData() throws Exception {

        fieldSearcher = loadSearcher(context)

        if (!fieldImportPage) {
            String importpath = context.findValue("importpath")
            fieldImportPage = getPageManager().getPage(importpath)
        }

        BufferedReader br = new BufferedReader(fieldImportPage.getReader())
        JsonSlurper slurper = new JsonSlurper()
        List<Data> batch = new ArrayList<>()

        try {
            String line
            while ((line = br.readLine()) != null) {

                line = line.trim()
                if (!line) {
                    continue
                }

                Map obj = (Map) slurper.parseText(line)
                Row row = jsonToRow(obj)

                Data target = findExistingRecord(row)
                if (target && !isUpdateData()) {
                    continue
                }

                if (!target) {
                    String idCell = determineId(obj)

                    PropertyDetail parentDetail = getSearcher().getDetail("_parent")
                    String parentid = parentDetail ? obj.get("_parent")?.toString() : null

                    if (parentDetail) {
                        target = findExistingData(idCell, parentid)
                    } else {
                        target = findExistingData(idCell, null)
                    }

                    if (!target && isAddNewData()) {
                        target = getSearcher().createNewData()
                        target.setId(idCell)
                        if (parentDetail) {
                            target.setProperty("_parent", parentid)
                        }
                    }
                }

                if (!target) {
                    continue
                }

                fieldLastNonSkipData = target
                addProperties(row, target)
                batch.add(target)

                if (batch.size() >= 3000) {
                    getSearcher().saveAllData(batch, context.user)
                    batch.clear()
                }
            }

        } finally {
            FileUtils.safeClose(br)
            getPageManager().removePage(getImportPage())
        }

        getSearcher().saveAllData(batch, context.user)
    }

    // --------------------------
    // ID GENERATION
    // --------------------------

    protected String determineId(Map obj) {
        if (isMakeId()) {
            return hashRow(obj)
        } else {
            def id = obj.get("id")
            return id ? id.toString() : null
        }
    }

    private String hashRow(Map obj) {
        def canonical = obj.keySet()
                           .sort()
                           .collect { k -> "${k}=${obj[k] ?: ''}" }
                           .join("|")

        MessageDigest md = MessageDigest.getInstance("SHA-1")
        byte[] digest = md.digest(canonical.getBytes("UTF-8"))
        digest.collect { String.format("%02x", it) }.join()
    }

    // --------------------------
    // JSON → Row
    // --------------------------

    protected Row jsonToRow(Map obj) {
        Header header = new Header()
        List<String> columns = new ArrayList<>(obj.keySet())
        header.setHeaders(columns)

        String[] data = new String[columns.size()]
        for (int i = 0; i < columns.size(); i++) {
            def v = obj[columns[i]]
            data[i] = v == null ? "" : v.toString()
        }

        Row row = new Row()
        row.setHeader(header)
        row.setData(data)
        return row
    }

   

    @Override
    protected Data findExistingRecord(Row row) {
        return null
    }

    @Override
    boolean isAddNewData() {
        return true
    }
}


JsonlImporter importer = new JsonlImporter()
importer.setModuleManager(moduleManager)
importer.setContext(context)
importer.setLog(log)
importer.importData()
