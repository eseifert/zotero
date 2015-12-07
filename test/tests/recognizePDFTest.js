describe("PDF Recognition", function() {
	Components.utils.import("resource://gre/modules/FileUtils.jsm");

	var win;
	before(function() {
		this.timeout(60000);
		// Load Zotero pane, install PDF tools, and load the
		// translators
		return Zotero.Promise.all([loadZoteroPane().then(function(w) {
			win = w;
		}), installPDFTools()]);
	});
	afterEach(function() {
		for(let win of getWindows("chrome://zotero/content/pdfProgress.xul")) {
			win.close();
		}
	});
	after(function() {
		win.close();
	});

	it("should recognize a PDF with a DOI", function* () {
		this.timeout(30000);
		// Import the PDF
		var testdir = getTestDataDirectory();
		testdir.append("recognizePDF_test_DOI.pdf");
		var item = yield Zotero.Attachments.importFromFile({
			file: testdir
		});

		// Recognize the PDF
		win.ZoteroPane.selectItem(item.id);
		win.Zotero_RecognizePDF.recognizeSelected();

		return waitForItemEvent("add").then(function(ids) {
			var item = Zotero.Items.get(ids[0]);
			assert.equal(item.getField("title"), "Shaping the Research Agenda");
			assert.equal(item.getField("libraryCatalog"), "CrossRef");
		});
	});

	it("should recognize a PDF without a DOI", function* () {
		if (Zotero.noUserInput) this.skip(); // CAPTCHAs make this fail
		
		this.timeout(30000);
		// Import the PDF
		var testdir = getTestDataDirectory();
		testdir.append("recognizePDF_test_GS.pdf");
		var item = yield Zotero.Attachments.importFromFile({
			file: testdir
		});

		// Recognize the PDF
		win.ZoteroPane.selectItem(item.id);
		win.Zotero_RecognizePDF.recognizeSelected();

		return waitForItemEvent("add").then(function(ids) {
			var item = Zotero.Items.get(ids[0]);
			assert.equal(item.getField("title"), "Scaling study of an improved fermion action on quenched lattices");
			assert.equal(item.getField("libraryCatalog"), "Google Scholar");
		});
	});
});