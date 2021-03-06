Ext.ns('tmn');

tmn.viewer = function() {

	return {
		
		display: function(response, options){
			var responseObj = Ext.util.JSON.decode(response.responseText),
				progress	= responseObj['progress'],
				data		= responseObj['data'],
				session		= options.params.session,
				isOverseas	= false,
				hasSpouse	= false,
				statusEl	= Ext.get('tmn-authviewer-overall-status-status');
				
			if (data['aussie-based'] !== undefined)	{						//if its the aussie based only version of the tmn
				isOverseas	= false;
				hasSpouse	= ((data['aussie-based']['s_firstname'] !== undefined && data['aussie-based']['s_firstname'] != null && data['aussie-based']['s_firstname'] != "") ? true : false);
			}

			if (data['international-assignment'] !== undefined) {			//if its an international version of the tmn
				isOverseas	= true;
				hasSpouse	= ((data['international-assignment']['s_firstname'] !== undefined && data['international-assignment']['s_firstname'] != null && data['international-assignment']['s_firstname'] != "") ? true : false);
			}
			
			for(levelCount = 1; levelCount <= 4; levelCount++) {
				levelName	= "level_" + levelCount + "_reasonPanel";
				this[levelName].hidePanel();
			}
			
			levelCount = 1;
			for (level in progress) {
				levelName	= "level_" + levelCount + "_reasonPanel";
				
				//render reasons
				if (progress[level].total > 0) {
					this[levelName].showPanel(Ext.decode(progress[level].reasons));
				}
				levelCount++;
			}

			//update control panel
			this.controlPanel.processSession(progress);
			
			//show actual tmn data
			this.summaryPanel.renderSummary(data, isOverseas, hasSpouse);
				
		},
		
		selectSession: function(combo, record, index) {
			//set the session
			this.session	= record.get('SESSION_ID');
			//let the control panel handel the rest
			this.controlPanel.selectSession(combo, record, index);
		},
		
		resetViewer: function() {
			this.controlPanel.resetControls();
			this.reasonPanel.resetPanel();
			this.summaryPanel.resetSummary();
		},
		
		init: function() {
			
			Ext.QuickTips.init();							// Enables quick tips and validation messages
			Ext.apply(Ext.QuickTips.getQuickTip(), {		// Quicktip defaults
			    showDelay: 250,
			    dismissDelay: 0,
			    hideDelay: 2000,
			    trackMouse: false
			});
			
			var loadingMask		= Ext.get('loading-mask');
			var loading			= Ext.get('loading');
			
			//G_SESSION is a global variable set in a script tag on the html page (droped in by the php file)
			//if the url has a session in it (G_SESSION holds the session sent in the url)
			this.session		=  G_SESSION;
			
			//create view
			this.controlPanel			= new tmn.view.AuthorisationViewerControlPanel(this);
			this.level_1_reasonPanel	= new tmn.view.AuthorisationPanel(this, {id: 'level_1_reason_panel', leader: 'Level 1 Authoriser', noNames: true});
			this.level_2_reasonPanel	= new tmn.view.AuthorisationPanel(this, {id: 'level_2_reason_panel', leader: 'Level 2 Authoriser', noNames: true});
			this.level_3_reasonPanel	= new tmn.view.AuthorisationPanel(this, {id: 'level_3_reason_panel', leader: 'Level 3 Authoriser', noNames: true});
			this.level_4_reasonPanel	= new tmn.view.AuthorisationPanel(this, {id: 'level_4_reason_panel', leader: 'Finance', noNames: true});
			this.summaryPanel			= new tmn.view.SummaryPanel(this);
			
			this.controlPanel.setWidth(900);
			this.controlPanel.render('tmn-viewer-controls-cont');
			
			this.level_1_reasonPanel.setWidth(900);
			this.level_1_reasonPanel.render('tmn-level-1-reasonpanel-cont');
			
			this.level_2_reasonPanel.setWidth(900);
			this.level_2_reasonPanel.render('tmn-level-2-reasonpanel-cont');
			
			this.level_3_reasonPanel.setWidth(900);
			this.level_3_reasonPanel.render('tmn-level-3-reasonpanel-cont');
			
			this.level_4_reasonPanel.setWidth(900);
			this.level_4_reasonPanel.render('tmn-level-4-reasonpanel-cont');
			
			this.summaryPanel.setWidth(900);
			this.summaryPanel.render('tmn-viewer-cont');
			
			//set handlers for events fired from control panel
			this.controlPanel.on('selectsession',	this.selectSession,	this);
			this.controlPanel.on('resetviewer',		this.resetViewer,	this);
			this.controlPanel.on('display',			this.display,		this);
			
			////////////////Loading Message Stuff///////////////
			//  Hide loading message
			loading.fadeOut({ duration: 0.2, remove: true });
			//  Hide loading mask
			loadingMask.setOpacity(1.0);
			loadingMask.shift({
				xy: loading.getXY(),
				width: loading.getWidth(),
				height: loading.getHeight(),
				remove: true,
				duration: 1.1,
				opacity: 0.1,
				easing: 'easeOut'
			});
		}
	};

}();

Ext.onReady(tmn.viewer.init, tmn.viewer);