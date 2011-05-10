
Ext.ns('tmn', 'tmn.view');

/**
 * @class		AuthorisationPanel
 * 
 * <p>
 * <b>Description:</b> The Panel that lets the user view, print and submit their TMN.
 * </p>
 * 
 * @author		Michael Harrison	(<a href="mailto:michael.harrison@ccca.org.au">michael.harrison@ccca.org.au</a>)
 * 				& Thomas Flynn		(<a href="mailto:tom.flynn@ccca.org.au">tom.flynn@ccca.org.au</a>)
 * 
 * @namespace 	tmn.view
 * @extends		Ext.Panel
 * @version		TMN 2.1.0
 * @note		The TMN uses the MVC design structure, read up on it at <a href="http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller">http://en.wikipedia.org/wiki/Model-view-controller</a>).
 * @demo		http://mportal.ccca.org.au/TMN
 */
tmn.view.AuthorisationViewerControlPanel = function(view, config) {
	/**
	 * @cfg {Object}	view			The object that defines the container that holds this form
	 * @note To be able to use this property you must pass it to the constructor when you create an instance of this class.
	 */
	this.view	= view		|| {};					//the view that this form is contained in
	//set config variable to passed or default
	config		= config	|| {};
	
	//G_SESSION is a global variable set in a script tag on the html page (droped in by the php file)
	//if the url has a session in it (G_SESSION holds the session sent in the url)
	this.session= G_SESSION;
	
	this.addEvents(
	
			/**
	         * @event selectsession
	         * Fires when the user clicks the next button.
	         */
			'selectsession',
			
			/**
	         * @event resetviewer
	         * Fires when the user clicks the next button.
	         */
			'resetviewer',
			
			/**
	         * @event display
	         * Fires when the user clicks the next button.
	         */
			'display'
	);

	//defines a store for storing sessions
	this.sessionStore	= new Ext.data.JsonStore({
        itemId:		'session_store',
        root:		'data',
        fields:		['SESSION_ID', 'SESSION_NAME', 'FIRSTNAME', 'SURNAME', 'EMAIL'],
        url:		'./php/auth/authviewer.php',
        autoLoad:	{
        	params: { mode: 'load' }
        },
        listeners: {
        	scope:	this,
        	load:	function(store, records, options) {
        		//select the session once the session combo has rendered
        		if (this.getSession() > 0) {
        			if (!this.rendered) {        				
        				this.on('afterrender', this.loadUrlSession, {controller:this, session:this.getSession()});
        			} else {
        				this.loadUrlSession.call({controller:this, session: this.getSession()}, this);
        			}
        		}
        	}
        }
    });
	
	/**
	 * The config that defines the physical layout of the panel.
	 * It is only used in construtor so there is no use in changing it dynamically. Edit it in the source.
	 */
	var config =  {
		title:		'Controls',
		frame:		true,
		layout:		'column',
		bodyStyle:	'padding:5px 5px 0px 5px',
		items: [
		        
			{
				layout: 'form',
				columnWidth:1,
				items: [
					{
					    id:				'session_combo',
			        	xtype:			'combo',
			        	width:			650,
					    fieldLabel:		'Session',
					    hiddenName:		'SESSION',
					    hiddenId:		'SESSION_hidden',
					    triggerAction:	'all',
			        	editable:		false,
					    forceSelection:	true,
					    allowBlank:		false,
					    
					    mode:			'local',
					    // store getting items from server
					    store:			this.sessionStore,
					    
					    valueField:		'SESSION_ID',
						displayField:	'SESSION_NAME',
					    tpl:			'<tpl for=\".\"><div class=\"x-combo-list-item\">({SESSION_ID}) {SESSION_NAME} - created by {FIRSTNAME} {SURNAME}</div></tpl>',
					    listeners:		{
					    	scope:	this,
					    	select: function(combo, record, index) {
					    		this.fireEvent('selectsession', combo, record, index);
					    	}
					    }
					}
				]
			},
			{
				layout: 'form',
	        	labelWidth:	200,
				columnWidth:.5,
				items: [
					{
					    id:			'mailto:' + G_LAZY_M_EMAIL_TO + '?bcc=' + G_LAZY_M_EMAIL_BCC + '&from=' + G_LAZY_M_EMAIL_FROM + '&subject=' + G_LAZY_M_EMAIL_SUBJECT + '&body=' + G_LAZY_M_EMAIL_BODY,
			        	xtype:		'linkbutton',
			        	fieldLabel:	'Email Missionaries who haven\'t submitted a TMN in the last 6 months',
					    text:		'Email Lazy Missionaries',
					    href:		'mailto:' + G_LAZY_M_EMAIL_TO + '?bcc=' + G_LAZY_M_EMAIL_BCC + '&from=' + G_LAZY_M_EMAIL_FROM + '&subject=' + G_LAZY_M_EMAIL_SUBJECT + '&body=' + G_LAZY_M_EMAIL_BODY,
					    listeners:	{
					    	scope: this,
					    	render: function(button) {
					    		console.log(button.href);
					    	}
					    }
					}
				]
			},
			{
				layout: 'form',
	        	labelWidth:	200,
				columnWidth:.5,
				items: [
					{
					    id:			'mailto:' + G_LAZY_A_EMAIL_TO + '?bcc=' + G_LAZY_A_EMAIL_BCC + '&from=' + G_LAZY_A_EMAIL_FROM + '&subject=' + G_LAZY_A_EMAIL_SUBJECT + '&body=' + G_LAZY_A_EMAIL_BODY,
			        	xtype:		'linkbutton',
			        	fieldLabel:	'Email Authorisers who have ignored a TMN for more than 2 weeks',
					    text:		'Email Lazy Authorisers',
					    href:		'mailto:' + G_LAZY_A_EMAIL_TO + '?bcc=' + G_LAZY_A_EMAIL_BCC + '&from=' + G_LAZY_A_EMAIL_FROM + '&subject=' + G_LAZY_A_EMAIL_SUBJECT + '&body=' + G_LAZY_A_EMAIL_BODY
					}
				]
			},
			{
				  xtype: 'box',
				  columnWidth:1,
				  autoEl:	{
					  			tag: 'center',
					  			html: '<div id="tmn-authviewer-overall-status" class=""><span id="tmn-authviewer-overall-status-label">Overall Status: </span><span id="tmn-authviewer-overall-status-status" style="color:#999999;">n/a</span></div>'
					  		}
			}
			
		]
	};
	
	//this is a call to tmn.view.TmnView's parent constructor (Ext.FormPanel), this will give tmn.view.TmnView all the variables and methods that it's parent does
	tmn.view.AuthorisationViewerControlPanel.superclass.constructor.call(this, config);
};

Ext.extend(tmn.view.AuthorisationViewerControlPanel, Ext.form.FormPanel, {
	
	getSession: function() {
		return this.session;
	},
	
	setSession: function(session) {
		this.session	= session;
	},
	
	fail: function() {
		Ext.MessageBox.show({
			icon: Ext.MessageBox.ERROR,
			buttons: Ext.MessageBox.OK,
			closable: false,
			title: 'Error!',
			msg: 'There was an error processing your request. Please try again.'
		});
		
		this.fireEvent('resetviewer');
	},

	//needs to be called on after render so needs to be called like so this.loadUrlSession.call({controller:this, session: this.getSession()}, this)
	loadUrlSession: function(form) {

		var sessionRecordIndex	= this.controller.sessionStore.find('SESSION_ID', this.controller.getSession()),
		combo					= form.getForm().items.map['session_combo'],
		sessionRecord;

		//if the session is found load it
		if (sessionRecordIndex >= 0) {
			//grab record
			sessionRecord		= this.controller.sessionStore.getAt(sessionRecordIndex);
			//set the combo to the right value
			form.getForm().items.map['session_combo'].setValue(sessionRecord.get('SESSION_NAME'));
			//select and load the session using the data just grabbed
			this.controller.selectSession(combo, sessionRecord, sessionRecordIndex);
		//if session not found tell user
		} else {
			Ext.MessageBox.show({
				icon: Ext.MessageBox.ERROR,
				buttons: Ext.MessageBox.OK,
				closable: false,
				title: 'Error!',
				msg: 'The session specified in the link was not found. Please select another one from drop down list. '
					+ 'If the session you are looking for isn\'t in the drop down please email '
					+ '<a href="mailto:tech.team@ccca.org.au">tech.team@ccca.org.au</a>.'
			});
		}
	},
	
	selectSession: function(combo, record, index) {
		
		this.session	= record.get('SESSION_ID');
		
		Ext.Ajax.request({
			url: './php/auth/authviewer.php',
			scope: this,
			params: {
				mode: 'get',
				session: record.get('SESSION_ID')
			},
			success: function(response, options) {
				this.fireEvent('display', response, options);
			},
			failure: this.fail
		});
	},
	
	processSession: function(progress) {
		
		var statusEl	= Ext.get("tmn-authviewer-overall-status-status"),
			htmlString	= '';
		
		//create html from response
		for (authCount=0; authCount < progress.length; authCount++) {
			htmlString += '<br />Approved by ' + progress[authCount].firstname + ' ' + progress[authCount].surname + ' - ' + progress.date;
		}
		
		//set overall status
		if (progress.response == 'Yes') {
			statusEl.setStyle('color', "#336600");
			statusEl.update(htmlString);
		}
	},
	
	resetControls:	function() {
		Ext.getCmp('session_combo').clearValue();
		Ext.get('tmn-authviewer-overall-status-status').setStyle('color', "#999999");
		Ext.get('tmn-authviewer-overall-status-status').update('n/a');
	}
	
});