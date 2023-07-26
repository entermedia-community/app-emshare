jQuery(document).ready(function()
{

	(function( $ ) {
		 
	    $.fn.emgrid = function() {
	    	
	    	//debugger;
	    	
            var grid = $( this );
            var gridwidth = grid.width();
            var cellpadding = parseInt(grid.data("cellpadding"));
            if(isNaN(cellpadding)) {
            	cellpadding = 10;
            }
            //get colum width divide by div width
            
            var colcount =  1;
            var colwidth = 100;
            if(grid.data("fixedwidth")) {
				colwidth = grid.data("fixedwidth"); 
				colcount =  gridwidth / (colwidth + cellpadding);
			}
			else {
	            if(grid.data("colcount"))
	            	{
	            	colcount = grid.data("colcount");
	            	colwidth = gridwidth / colcount;
	            	}
	            else {
		            colwidth = parseInt(grid.data("colwidth"));
		            colcount =  gridwidth / colwidth;
	            }
	            
	            
	            
	            if (colcount<1) {
	            	colcount = 1;
	            }
	           
	            //adjust the colwidth to spread out the extra space
	            var remainder = gridwidth - (colcount * (colwidth)) + cellpadding;
	            colwidth = colwidth + (remainder/colcount);
            }
            
            colcount = Math.floor(colcount);
            
            
            var columns = [];
            for(var i=0;i<colcount;i++)
            {
            	columns[i] = 0;
            }
            
            
            
            
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
      	        if(grid.data("fixedwidth")) {
					cell.css("width", cellwidth + "px");
					if (col >0 ) {
					//left
	      	        var left = (colwidth * col) + (cellpadding * col);
	      	        cell.css("left",left + "px");
	      	        }
				}
				else {
	      	        if (colcount >1 ) {
	    	        	cellwidth = colwidth-cellpadding;
	      	        }
	      	        cell.css("width", cellwidth + "px");
	      	        //left
      	        	var left = (colwidth * col);
      	        	cell.css("left",left + "px");
	      	        var cellimage = cell.find('.emgridcell-assetimage');
      	        
	      	        if (cellimage.length > 0)
	  	        	{
	  	        		var imgwidth = cellimage.data("width");
	  	        		var imgheight = cellimage.data("height");
	  	        		var setimgheight = colwidth*(imgheight/imgwidth);
	  	        		cellimage.find(".imagethumb").css("height", setimgheight+'px');
	  	        		
	  	        		cellimage.find(".videothumb").css("height", setimgheight+'px');
	  	        	}
      	        }
      	        
      	        
      	        var curheight = columns[col];
      	        var cellheight = cell.height();
      	        
      	        cell.css("top",curheight + "px");
      	        //columns[col] = curheight + cellheight + cellpadding;
      	        columns[col] = curheight + cellheight ;
      	        
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

	jQuery(window).on('resize',function(){
		//var thegrid = $('.emgrid');
		//thegrid.emgrid();
		jQuery( ".emgrid" ).each(function(){
			jQuery(this).emgrid();
	    } );

	});

	
});

