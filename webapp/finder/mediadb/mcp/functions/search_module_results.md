#set($applicationid = "${mcpapplicationid}")
#set($apphome = "/${mcpapplicationid}")
#set( $input = $keywords)

#if(!$input)
	#set( $input = $modulehits.getSearchQuery().getMainInput())
#end

#if( $organizedHits.size() <= 0 && $assethits.size() <= 0)
[[No results found]] #ifnotnull($input) [[for]] #mdTag("code", "#esc($input)") #end #ifnotnull($modulenamestext) [[in]] #mdTag("code", "#esc($modulenamestext)") #end
#end

#if( $organizedHits.size() > 0 )
#mdTag("h2", "Found ${organizedHits.size()} modules") 
#end

#set( $filter = $modulehits.findFilterValue("entitysourcetype") )

#foreach( $module in $organizedModules )
	#set($hits = $organizedHits.get($module.id))
	#ifnotnull($hits)

		#if(!$input)
			#set($input = "")
		#end

		#set($entityurl = "$!siteroot$apphome/views/modules/$!{module.id}/index.html?$!{module.id}page=1&field=description&operation=freeform&description.value=$input")

		#if( $module.id == "asset") ##this is safe
			#set( $count = $hits.size()) 
		#else
			#set( $count = $filter.getCount($module.id) ) 
		#end

		#ifnull($count)
			#set( $count = $hits.size()) 
		#end

- 🗄️ #mdTag("b", "#text($module)") · #mdLink("[[View in eMedia]]", "$entityurl")

		$hits.setHitsPerPage(10)

		#foreach( $hit in $hits.getPageOfHits() )
			#set($previewurl = "$apphome/views/modules/${module.id}/editors/default/tabs/index.html?entityid=${hit.id}")

			#set( $primarymediafield = $hit.primarymedia )

			#if($primarymediafield)
				#set( $primarymediatemp = $mediaarchive.getCachedAsset($hit.primarymedia))
					#ifnotnull($primarymediatemp)
						#set($rendertype = $mediaarchive.getMediaRenderType($primarymediatemp.fileformat))
						#if($rendertype != 'audio')				
							#set($primarymedia = $primarymediatemp)
						#end
				#end
			#end

			#ifnull($primarymedia)
				#set( $primarymediafield = $hit.primaryimage )
				#if($primarymediafield)
					#ifnotnull($hit.primaryimage)
							#set( $primarymediatemp = $mediaarchive.getCachedAsset($hit.primaryimage))
							#set($rendertype = $mediaarchive.getMediaRenderType($primarymediatemp.fileformat))
							#if($rendertype != 'audio')
								#set($primarymedia = $primarymediatemp)
							#end
					#end
				#end
			#end	

	   	#set($link = "$!siteroot$applink/views/modules/$!topmodule.getId()/index.html")
			#if( $parentmodule == $module)
				#set($link = "$link?entityid=$!entity.getId()&entitytype=$!{module.id}&topentityid=$!entity.getId()")
			#else
				#set($link = "$link?entityid=$!entity.getId()&entitytype=$!{module.id}&topentityid=$!topentityid")
			#end

			#set($tabletarget = $mediaarchive.getCatalogSettingValue("tablethumbnail"))
			#if($tabletarget)
				#set( $imagepath = $mediaarchive.asLinkToGenerated($hit, $tabletarget))  
			#else
				#set($imagesize = "image110x62cropped")
				#set( $imagepath = $mediaarchive.asLinkToGenerated($hit, $imagesize))
			#end
#mdLink("<img alt='#if($title)#esc($title)#else$!{hit.name}#end' src='$imagepath'>", "$link")
		#end 
	#end 
#end


#if($assethits)

#if( $assethits.size() > 0 )
	#if($organizeHits.size() > 0)
---
	#end

#mdTag("h2", "Found ${assethits.size()} assets") 
#end

	#set($assetmodule = $mediaarchive.getCachedData("module","asset"))
	#set($hits = $assethits)

	#if($hit.getPageOfHits().size() == 0)
[[No results found]]
	#else
		#set($edithome = "$apphome/views/modules/asset/editors/quicksearch")
		#set($entityurl = "${edithome}/index.html?search=$input")
		#set( $count = $assethits.size())

- 🖼️ #mdTag("b", "#text($assetmodule)") · #mdLink("[[View in eMedia]]", "$entityurl")

		#set( $searchhome = "$apphome/views/modules/${assetmodule.id}/results/default" )
		$hits.setHitsPerPage(10)
		#foreach( $hit in $hits.getPageOfHits() )
			#if( ($hit.previewstatus != "2" &&
				$hit.previewstatus != "exif" &&
				$hit.previewstatus != "mime" &&
				$hit.previewstatus != "1" &&
				$hit.previewstatus != "generated") &&
				!$mediaarchive.isCatalogSettingTrue("realtimethumbs")
			)

				#set($asset = $mediaarchive.getAsset($hit.id))
				#if($stackedfield)
					#set($title = $asset.getText($stackedfield,$context))
				#end

				#if(!$title)		         	
					#if( $asset.assettitle )
						#set($title =  $asset.getText("assettitle",$context)) 
					#else 
						#set($title = $asset.getText("name",$context) )
					#end
				#end

				#set($dlink = $mediaarchive.asLinkToOriginal($hit))
				#set($dlink = "$siteroot/$mediadbappid/services/module/asset/downloads/originals/$dlink?assetid=$!hit.getId()")
				#if($collectionid)
					#set($dlink = "$dlink&collectionid=$!{collectionid}")
				#end

				#set($imagesize = "image200x200")
				#set($imagepath = $mediaarchive.asLinkToGenerated($hit, $imagesize))

				#set($clearcache = $context.getRequestParameter("clearcache"))
				#ifnotnull($clearcache)
					#set( $time = $context.getLocaleManager().getDateStorageUtil().getTime( $hit.get("assetmodificationdate") ) )
					#set( $urlparams= "?_=$time")
				#end
				#ifnotnull($imagebox)
					#if($imagebox.timecodestartseconds > -1)
						#ifnotnull($urlparams)
							#set($urlparams = "$urlparams&timeoffset=$imagebox.timecodestartseconds")
						#end
						#ifnull($urlparams)
							#set($urlparams = "?timeoffset=$imagebox.timecodestartseconds")
						#end
					#end
				#end
#mdLink("<img alt='#if($title)#esc($title)#else$!{hit.name}#end' src='$imagepath$!urlparams'>", "$link")
			#end
		#end
	#end
#end 
