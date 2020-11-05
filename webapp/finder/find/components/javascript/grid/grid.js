$(document).ready(function()
{

	(function( $ ) {
		 
	    $.fn.emgrid = function() {
	 
            var grid = $( this );
            var colwidth = parseInt(grid.data("colwidth"));
            var gridw = grid.width();
            var cellpadding = parseInt(grid.data("cellpadding"));
            if(isNaN(cellpadding)) {
            	cellpadding = 210;
            }
            //get colum width divide by div width
            var colcount = grid.width() / colwidth;
            colcount = Math.floor(colcount);
            
            if (colcount<1) {
            	colcount = 1;
            }
           
            //adjust the colwidth to spread out the extra space
            var remainder = grid.width() - (colcount * colwidth);
            colwidth = colwidth + (remainder/colcount);
            
            var columns = [];
            for(var i=0;i<colcount;i++)
            {
            	columns[i] = 0;
            }
            
            
            
            //debugger;
            var col = 0;
            
            var cells = grid.children( ".emgridcell" );
	    	
            cells.each(function() 
        	        {
            	var cell = $(this);
            		cell.css("visibility","hidden");
        	        });
            cells.each(function() 
	        {
      	        var cell = $(this);
      	        var cellwidth = colwidth;
      	        if (colcount >1 ) {
    	        	cellwidth = colwidth-cellpadding;
      	        }
      	        cell.css("width", cellwidth + "px");
      	        
      	        var cellimage = cell.find('.emgridcell-assetimage');
      	        
      	        if (cellimage.length > 0)
  	        	{
  	        		var imgwidth = cellimage.data("width");
  	        		var imgheight = cellimage.data("height");
  	        		var setimgheight = colwidth*(imgheight/imgwidth);
  	        		cellimage.find(".imagethumb").css("height", setimgheight+'px');
  	        		
  	        		cellimage.find(".videothumb").css("height", setimgheight+'px');
  	        	}
      	        
      	        var curheight = columns[col];
      	        var cellheight = cell.height();
      	        
      	        cell.css("top",curheight + "px");
      	        columns[col] = curheight + cellheight + cellpadding;
      	        //left
      	        var left = colwidth * col;
      	        cell.css("left",left + "px");
      	        cell.css("visibility","visible");
      	        col++;
      	        if( col == colcount)
      	        {
      	        	
      	        	if (grid.hasClass("emgridlimited") && colcount>=4) {
      	        		return false;
      	        	}
      	        	col = 0;
      	        	
      	        }
            });		
	        var tallest = 0;
	        for(var i=0;i<colcount;i++)
            {
            	if( tallest < columns[i] )
            	{
            		tallest = columns[i];
            	}
            }
            grid.css("height",tallest + 'px');
            
	        return this;
	 
	    };
	 
	}( jQuery ));
	
	lQuery(".emgrid").livequery(function() {
        $( ".emgrid" ).each(function(){
        	$(this).emgrid();
        } );
	});
	
	$(window).on('resize',function(){
		//var thegrid = $('.emgrid');
		//thegrid.emgrid();
        $( ".emgrid" ).each(function(){
        	$(this).emgrid();
        } );

	});
	
});
