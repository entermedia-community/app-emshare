//jAnqular controller

if( !jQuery.fn.assetAnnotations ) { 

(function ( $ ) {
	$.fn.assetAnnotations = function( options ) {
	
	console.log("Annotations init");
	
	var scope = new Scope();
	scope.add("app", jQuery("#application") );
	scope.add("home" ,scope.app.data("siteroot") );
	scope.add("apphome" , scope.app.data("apphome") );
	scope.add("dbhome" , "/" + scope.app.data("mediadbappid") );

	var area = $("#annotationarea");
	scope.add("componentroot" ,scope.app.data("home") );
	scope.add("catalogid" ,area.data("catalogid"));	
	scope.add("assetid" ,area.data("assetid"));	
	scope.add("userid" ,area.data("userid"));	
	scope.add("userColor" ,area.data("usercolor"));
	
	var editor = new AnnotationEditor(scope);
	scope.add("annotationEditor",editor);
	//jAngular.addScope("annoscope",scope);
	
	editor.loadModels();
	
	jQuery("#annotation-toolbar li").on('click', function()
	{
		var id = $(this).attr("id");
		if( id == "movetool")
		{
			editor.fabricModel.selectTool('move');
		}
		else if( id == "drawtool")
		{
			editor.fabricModel.selectTool('draw');
		}
		else if( id == "rectangletool")
		{
			editor.fabricModel.setShapeTypeFromUi('rectangle');
		}
		else if( id == "circletool")
		{
			editor.fabricModel.setShapeTypeFromUi('circle');
		}
		else if( id == "colortoolbararea")
		{
			editor.colorPicker.colorpicker('open');
		}
		else if( id == "deletetool")
		{
			editor.deleteAnnotations();
		}
		
	});
	
	};

	}( jQuery ));
} 
else {
	//Dont reload
}

jQuery(document).ready(function()
{
	$("#annotation-holder").assetAnnotations();
});





