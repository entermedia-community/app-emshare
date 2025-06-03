#set($applicationid = "${mcpapplicationid}")
#set($apphome = "/${mcpapplicationid}")

#set($H = "#")

#ifnull($organizedHits)
	#set( $$organizedHits = [])
#end
#ifnull($assethits)
	#set( $$assethits = [])
#end

#if( $organizedHits.size() <= 0 && $assethits.size() <= 0)
No results found for $keywordsstring #ifnotnull($modulenamestext) in $modulenamestext #end
#else

	#if( $organizedHits.size() > 0 )

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

#mdTag("h2", "Found ${count} types")

$H$H$H 📁 #mdTag("b", "#text($module)")    (#mdLink("Open in eMedia", "$entityurl"))

			$hits.setHitsPerPage(12)

			#foreach( $hit in $hits.getPageOfHits() )
				#set($previewurl = "$!siteroot$apphome/views/modules/${module.id}/editors/default/tabs/index.html?entityid=${hit.id}")

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
					#set($link = "$link?entityid=${hit.id}&entitytype=$!{module.id}&topentityid=${hit.id}")
				#else
					#set($link = "$link?entityid=${hit.id}&entitytype=$!{module.id}&topentityid=$!topentityid")
				#end

				#set($tabletarget = $mediaarchive.getCatalogSettingValue("tablethumbnail"))

				#if($tabletarget)
					#set( $imagepath = $mediaarchive.asLinkToGenerated($hit, $tabletarget))
				#else
					#set($imagesize = "image110x62cropped")
					#set( $imagepath = $mediaarchive.asLinkToGenerated($hit, $imagesize))
				#end

#mdLink("<img alt='#if($title)#esc($title)#else$!{hit.name}#end' src='$siteroot$imagepath'>", "$link")

			#end
		#end
	#end
#end

#if( $assethits.size() > 0 )

	#if($organizeHits.size() > 0)
---
	#end

#mdTag("h2", "Found ${assethits.size()} files")

	#set($assetmodule = $mediaarchive.getCachedData("module","asset"))
	#set($hits = $assethits)
	#set($edithome = "$!siteroot$apphome/views/modules/asset/editors/quicksearch")
	#set($entityurl = "${edithome}/index.html?search=$input")

$H$H$H 📄 #mdTag("b", "#text($assetmodule)")    (#mdLink("Open in eMedia", "$entityurl"))

	$hits.setHitsPerPage(12)

	#set($parsedAssets = [])
	#set($threes = [])

  #foreach( $hit in $hits.getPageOfHits()  )
		#set($asset = $mediaarchive.getAsset($hit.id))

    #set($title = $hit.name)

		#ifnull($title)
			#if($stackedfield)
				#set($title = $asset.getText($stackedfield,$context))
			#end
		#end

    #ifnull($title)
      #if( $asset.assettitle )
        #set($title =  $asset.getText("assettitle",$context))
      #else
        #set($title = $asset.getText("name",$context) )
      #end
    #end

    #set($dlink = $mediaarchive.asLinkToOriginal($hit))
    #set($dlink = "$siteroot/$mediadbappid/services/module/asset/downloads/originals/$dlink?assetid=${hit.id}")

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

		#set($link = "$!siteroot$apphome?assetid=${hit.id}$")

		#if($threes.size() < 3)
			#if($threes.add(["#if($title)#esc($title)#else$!{hit.name}#end", "$siteroot$imagepath$!urlparams", "$link"]))#end
		#else
			#if($parsedAssets.add($threes))#end
			#set($threes = [])
		#end

	#end

	#if($threes.size() > 0)
		#if($parsedAssets.add($threes))#end
	#end

| | | |
|:-------------------------:|:-------------------------:|:-------------------------:|
#foreach( $assets in $parsedAssets)#foreach( $asset in $assets )|#mdLink("<img alt='${asset[0]}' src='${asset[1]}'>", "${asset[1]}" )#end|
#end

#end
#end
