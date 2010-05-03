
Ext.ns('TMN');

TMN.ViewPanel = Ext.extend(Ext.Panel, {
	
	id: 'view_panel', //enter id
	guid: '',
	session: '',
	
	set_guid_session: function (guid, session){
		this.guid = guid;
		this.session = session;
	},
		
	initComponent: function() {
		
		var config = {
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		TMN.ViewPanel.superclass.initComponent.apply(this, arguments); // change Form to match above name (ln 4)
	}, //eo initForm
	
	//required function do not edit unless you know what you are doing
	loadForm: function (successCallback, failureCallback) {
		//var res = '{"success":"true","tmn_data":{"firstname":"test","s_firstname":"debug","surname":"user","s_surname":"user","date":"01 Apr 2010","s_date":"01 Apr 2010","fan":"1234","s_fan":"1234","ministry":"SL","s_ministry":"Family Life","ft_pt_os":"Full Time","s_ft_pt_os":"Part Time","days_per_wk":4,"s_days_per_wk":2,"net_stipend":"1234","s_net_stipend":"4123","additional_tax":"0","s_additional_tax":"22","post_tax_super":"234","s_post_tax_super":"23","taxable_income":"1639","s_taxable_income":"5222","pre_tax_super":"11","s_pre_tax_super":"76","housing":"4321","housing_frequency":"1","additional_housing":"2721","additional_life_cover":"2","s_additional_life_cover":"0","additional_life_cover_source":"Super Fund","s_additional_life_cover_source":"Support Account","mfb":"1639","s_mfb":"2611","mfb_rate":"Full","s_mfb_rate":"Half","mmr":"234","s_mmr":"4444","financial_package":2466,"s_financial_package":5300,"joint_financial_package":7766,"employer_super":"147","s_employer_super":"470","total_super":392,"s_total_super":569,"resc":11,"s_resc":76,"super_fund":"IOOF","s_super_fund":"IOOF","ministry_levy":10,"transfers":[{"name":"Michael Harrison","amount":"100"},{"name":"Tom Flynn","amount":"750"},{"name":"andrew","amount":"40"}],"total_transfers":890,"workers_comp":116,"buffer":19212,"ccca_levy":873,"tmn":9606}}';

		var returnObj = JSON.parse(this.response);
		var values = returnObj['tmn_data'];
		
		var single_tpl = new Ext.XTemplate(
			'<table width="100%"><tr><td><h2>Total Monthly Needs/ Periodic Payments (v2.0.2)</h2></td><td align="right"><img src="http://www.ccca.org.au/tntmpd/TntMPDCCCALogo-new.JPG" alt="CCCA Logo" width="150" height="50"></td></tr></table><p>&nbsp;</p><p>- Print a copy for your own records.<br />- Have it authorised by the appropriate people.<br>- If this is your first TMN, submit to Member Care (PO Box 565, Mulgrave, Vic, 3170).<br>- Otherwise submit it to Payroll (PO Box 565, Mulgrave, Vic, 3170).</p><table width="90%"><tr><td width="30%"><strong>Name:</strong> {firstname} {surname}</td><td width="30%"><strong>Date:</strong> {date}</td><td width="40%"><strong>Support Account:</strong> {fan}</td></tr></table><p>&nbsp;</p><table width="100%">  <tr>    <th align="right" colspan="4">(From this year on your support account no. will have the form 101#### instead of 800####, so <b style="color:red;">DON"T PANIC!!!</b>)</td>  </tr> <tr>    <td colspan="4">&nbsp;</td>  </tr> <tr>    <th scope="row" colspan="2">&nbsp;</th>    <th align="center" colspan="2">Your Account must be above: ${buffer}</td>  </tr>  <tr>    <th colspan="4" scope="col">&nbsp;</th></tr>  <tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Name</th>    <td colspan="2" align="center">{firstname}</td>  </tr><tr>    <td colspan="4"><hr></td>  </tr><tr>    <th colspan="2" scope="row">Ministry</th>    <td colspan="2"align="center">{ministry}</td></tr><tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Status</th>    <td colspan="2" align="center">{ft_pt_os} - {days_per_wk} Days</td>  </tr><tr>    <td colspan="4"><hr></td>  </tr>  <tpl if="housing_stipend == 0"><tr>    <th colspan="2" scope="row">Net Stipend (Money in your account)</th>    <td colspan="2" align="center">${net_stipend}</td>  </tr></tpl><tpl if="housing_stipend &gt; 0"><tr>    <th colspan="2" scope="row">Stipend (Money in your account)</th>    <td colspan="2" align="center">${stipend}</td>  </tr><tr>    <th colspan="2" scope="row">Housing Stipend (The amount of your stipend that will be used on housing)</th>    <td colspan="2" align="center">${housing_stipend}</td>  </tr><tr>    <th colspan="2" scope="row">Net Stipend (Stipend + Housing Stipend)</th>    <td colspan="2" align="center">${net_stipend}</td>  </tr></tpl><tr>    <th colspan="2" scope="row">Estimated Tax </th>    <td colspan="2" align="center">${tax}</td>  </tr><tr>    <th colspan="2" scope="row">Additional Tax </th>    <td colspan="2" align="center">${additional_tax}</td>  </tr>  <tr>    <th colspan="2" scope="row">Post-tax Super </th>    <td colspan="2" align="center">${post_tax_super}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Taxable Income (Net Stipend + Estimated Tax + Additional Tax + Post-Tax Super)</th>    <td colspan="2" align="center">${taxable_income}</td>  </tr>  <tr>    <th colspan="2" scope="row">Pre-tax Super </th>    <td colspan="2" align="center">${pre_tax_super}</td>  </tr>  <tr>    <th colspan="2" scope="row">Additional Life Cover (per month)</th>    <td colspan="2" align="center">${additional_life_cover}</td>  </tr>  <tr>    <th colspan="2" scope="row">MFB\'s</th>    <td colspan="2" align="center">${mfb}</td>  </tr><tpl if="claimable_mfb &lt; mfb"><tr>    <th colspan="2" scope="row">Claimable MFB\'s (The amount of MFB\'s left after housing is taken out. i.e. The amount you can still make claims from.)</th>    <td colspan="2" align="center">${claimable_mfb}</td>  </tr></tpl><tr>    <th colspan="2" scope="row">MFB Claim Rate</th>    <td colspan="2" align="center">{mfb_rate}</td>  </tr>  <tr>    <th colspan="2" scope="row">Financial Packages </th>    <td colspan="2" align="center">${financial_package}</td>  </tr>  <tr>    <th colspan="2" scope="row">Joint Financial Package</th>    <td colspan="2" align="center">${joint_financial_package}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Employer Super </th>    <td colspan="2" align="center">${employer_super}</td>  </tr><tr><th colspan="2" scope="row">Total Super </th><td colspan="2" align="center">${total_super}</td></tr><tr>    <th colspan="2" scope="row">Reportable Employer Super Contribution (RESC)</td>    <td colspan="2" align="center">${resc}</td>  </tr>  <tr>    <th scope="row" colspan="2">Super Choice</th>    <td colspan="2" align="center">{super_fund}</td>  </tr>	<tpl if="additional_life_cover &gt; 0">		<tr>		    <th colspan="2" scope="row">Amount of Additional Life Cover</th>		    <td colspan="2" align="center">${additional_life_cover}</td>		</tr>	</tpl>	<tr>		    <th colspan="2" scope="row">Additional Income Protection Premium paid from</th>		    <td colspan="2" align="center">{income_protection_cover_source}</td>		</tr>	  <tr>    <td colspan="4"><hr></td>  </tr><tpl if="housing &gt; 0">  <tr>    <th colspan="2" scope="row">Housing from Support Account</td>    <td align="center" colspan="2">${housing}</td>  </tr>  <tr>    <th scope="row" colspan="2">Additional Housing Allowance</th>    <td align="center" colspan="2">${additional_housing} is additional housing</td>  </tr>  <tr>    <th scope="row" colspan="2">Frequency of Housing Payments</th>    <td align="center" colspan="2">{housing_frequency}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr></tpl>  <tr>    <th colspan="2" scope="row">MMR</th>    <td colspan="2" align="center">${mmr}</td>    </tr><tr>    <td colspan="4"><hr></td>  </tr><tpl if="total_transfers &gt; 0">	<tr>	    <th colspan="2" scope="row">Contribution Transfers: </th>	    <td align="center">Name</td>	    <td align="center">Amount</td>	</tr>	<tpl for="transfers">		<tr>		    <th colspan="2" scope="row"></th>		    <td align="center">{name}</td>		    <td align="center">${amount}</td>		</tr>	</tpl>	<tr>	    <td colspan="4"><hr></td>	</tr></tpl>  <tr>    <th colspan="2" scope="row">Total Contribution Transfers</th>    <td align="center" colspan="2">${total_transfers}</td>  </tr><tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Worker\'s Compensation</th>    <td align="center" colspan="2">${workers_comp}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr>				  <tr>		    <th colspan="2" scope="row">CCCA Levy</th>		    <td align="center" colspan="2">${ccca_levy}</td>		  </tr>		<tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Total Monthly Needs</th>    <td align="center" colspan="2">${tmn}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr> </table>  <p>&nbsp;</p> <h2>Update Payment Methods</h2> <p>&nbsp;</p> <p><u>If your bank or credit card details have changed</u></p><p>Please record them below.</p><tpl if="housing &gt; 0"><p>&nbsp;</p><table width="100%">  <tr><td><h4>Housing Payments</h4></td>  <td><strong>Bank Account (preferred)</strong></td><td><strong>Cheque</strong></td>  </tr>  <tr><td>&nbsp;</td>  <td><p>Name on Account:</p>_____________________</td>  <td><p>Name on Cheque:</p>_____________________</td>  </tr>  <tr><td>&nbsp;</td>  <td valign="top"><p>BSB:</p>__ __ __ / __ __ __</td>  <td><p>Postal Address:</p>_____________________<p>_______________________</p></td>  </tr>  <tr><td>&nbsp;</td>  <td><p>Account Number:</p>_____________________</td>  <td><p>Reference (if needed):</p>_____________________</td>  </tr>  </table></tpl><br><p>Record your credit card details, but only if they have changed.</p> <table width="100%">	<tr><td valign="top"><h4>Bank Account</h4></td>    <td valign="top"><p>Name on Account</p>      <p><br>    ______________________________</p></td></tr>    <tr><td valign="top"><p>BSB</p>      <p><br>    __ __ __ /__ __ __</p></td>    <td valign="top"><p>Account Number</p>      <p><br>    _______________________________</p></td></tr>	</table>	 <p>&nbsp;</p>	<table width="100%">      <tr>        <td valign="top"><h4>Credit Card</h4></td>        <td valign="top"><p>Name on Card</p>          <p><br>          ______________________________</p></td></tr>        <tr><td valign="top"><p>Financial Institution</p>          <p><br>          ______________________________</p></td>        <td valign="top"><p><br>          <input type="checkbox" name="checkbox" value="checkbox">              Visa<br>              <input type="checkbox" name="checkbox" value="checkbox">          MasterCard</p>          </td>		</tr><tr>        <td valign="top"><p>BPay Reference Number (this may or may not be your card number):</p>          <p><br>          __ __ __ __ - __ __ __ __ - __ __ __ __ - __ __ __ __</p></td>        <td valign="top"><p>BPay Biller Code:</p>          <p><br>          __ __ __ __ - __ __ __ __</p></td>      </tr>    </table>  <p>&nbsp;</p><h4>Authorisation<tpl if="auth_lv2"><br/> - your TMN must be approved by your NML because:</tpl>	<tpl for="auth_lv2_reasons">		<br/> &nbsp;&nbsp;&nbsp;&nbsp;- {reason}	</tpl><tpl if="auth_lv3"><br/> - Your TMN must be approved by your MGL because:</tpl>	<tpl for="auth_lv3_reasons">		<br/> &nbsp;&nbsp;&nbsp;&nbsp;- {reason}	</tpl></h4><table><tr><td>Signature: _________________________________________________________</td><td>Date: ___________________</td></tr><tpl if="auth_lv1"><tr><td colspan="2"><p>&nbsp;</p></td></tr><tr><td>Ministry Overseer Signature: _________________________________________________________</td><td>Date: ___________________</td></tr></tpl><tpl if="auth_lv2"><tr><td colspan="2"><P>&nbsp;</P></td></tr><tr><td>National Ministry Leader Signature: _________________________________________________________</td><td>Date: ___________________</td></tr></tpl><tpl if="auth_lv3"<tr><td colspan="2"><P>&nbsp;</P></td></tr><tr><td>Ministry Group Leader Signature: _________________________________________________________</td><td>Date: ___________________</td></tr></tpl></table><p align="right">Revision Date: 1/04/2010</p>'
		);
		
		var spouse_tpl = new Ext.XTemplate(
			'<table width="100%"><tr><td><h2>Total Monthly Needs/ Periodic Payments (v2.0.2)</h2></td><td align="right"><img src="http://www.ccca.org.au/tntmpd/TntMPDCCCALogo-new.JPG" alt="CCCA Logo" width="150" height="50"></td></tr></table><p>&nbsp;</p><p>- Print a copy for your own records.<br />- Have it authorised by the appropriate people.<br>- If this is your first TMN, submit to Member Care (PO Box 565, Mulgrave, Vic, 3170).<br>- Otherwise submit it to Payroll (PO Box 565, Mulgrave, Vic, 3170).</p><table width="90%"><tr><td width="30%"><strong>Name:</strong> {firstname} {surname} & {s_firstname} {s_surname}</td><td width="30%"><strong>Date:</strong> {date}</td><td width="40%"><strong>Support Account:</strong> {fan}</td></tr></table><p>&nbsp;</p><table width="100%"> <tr>    <th align="right" colspan="4">(From this year on your support account no. will have the form 101#### instead of 800####, so <b style="color:red;">DON"T PANIC!!!</b>)</td>  </tr> <tr>    <td colspan="4">&nbsp;</td>  </tr> <tr>    <th scope="row" colspan="2">&nbsp;</th>    <th align="right" colspan="2">Your Account must be above: ${buffer}</td>  </tr>  <tr>    <th colspan="2" scope="col">&nbsp;</th>    <th scope="col" style="text-align:center;">Me</th>    <th scope="col" style="text-align:center;">Spouse</th>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Name</th>    <td align="center">{firstname}</td>    <td align="center">{s_firstname}</td>  </tr><tr>    <td colspan="4"><hr></td>  </tr><tr>    <th colspan="2" scope="row">Ministry</th>    <td align="center">{ministry}</td>    <td align="center">{s_ministry}</td></tr><tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Status</th>    <td align="center">{ft_pt_os} - {days_per_wk} Days</td>    <td align="center">{s_ft_pt_os} - {s_days_per_wk} Days</td>  </tr><tr>    <td colspan="4"><hr></td>  </tr> <tpl if="housing_stipend == 0"> <tr>    <th colspan="2" scope="row">Net Stipend (Money in your account)</th>    <td align="center">${net_stipend}</td>    <td align="center">${s_net_stipend}</td>  </tr></tpl><tpl if="housing_stipend &gt; 0"><tr>    <th colspan="2" scope="row">Stipend (Money in your account)</th>    <td align="center">${stipend}</td> <td align="center">${s_stipend}</td> </tr><tr>    <th colspan="2" scope="row">Housing Stipend (The amount of your stipend that will be used on housing)</th>    <td align="center">${housing_stipend}</td> <td align="center">${s_housing_stipend}</td> </tr><tr>    <th colspan="2" scope="row">Net Stipend (Stipend + Housing Stipend)</th>    <td align="center">${net_stipend}</td> <td align="center">${s_net_stipend}</td> </tr></tpl><tr>    <th colspan="2" scope="row">Estimated Tax </th>    <td align="center">${tax}</td>    <td align="center">${s_tax}</td>  </tr><tr>    <th colspan="2" scope="row">Additional Tax </th>    <td align="center">${additional_tax}</td>    <td align="center">${s_additional_tax}</td>  </tr>  <tr>    <th colspan="2" scope="row">Post-tax Super </th>    <td align="center">${post_tax_super}</td>    <td align="center">${s_post_tax_super}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Taxable Income (Net Stipend + Estimated Tax + Additional Tax + Post-Tax Super)</th>    <td align="center">${taxable_income}</td>    <td align="center">${s_taxable_income}</td>  </tr>  <tr>    <th colspan="2" scope="row">Pre-tax Super </th>    <td align="center">${pre_tax_super}</td>    <td align="center">${s_pre_tax_super}</td>  </tr>  <tr>    <th colspan="2" scope="row">Additional Life Cover (per month)</th>    <td align="center">${additional_life_cover}</td>    <td align="center">${s_additional_life_cover}</td>  </tr>  <tr>    <th colspan="2" scope="row">MFB\'s</th>    <td align="center">${mfb}</td>    <td align="center">${s_mfb}</td>  </tr><tpl if="claimable_mfb &lt; mfb"><tr>    <th colspan="2" scope="row">Claimable MFB\'s (The amount of MFB\'s left after housing is taken out. i.e. The amount you can still make claims from.)</th>    <td align="center">${claimable_mfb}</td> <td align="center">${s_claimable_mfb}</td> </tr></tpl><tr>    <th colspan="2" scope="row">MFB Claim Rate</th>    <td align="center">{mfb_rate}</td>    <td align="center">{s_mfb_rate}</td>  </tr>  <tr>    <th colspan="2" scope="row">Financial Packages </th>    <td align="center">${financial_package}</td>    <td align="center">${s_financial_package}</td>  </tr>  <tr>    <th colspan="2" scope="row">Joint Financial Package</th>    <td colspan="2" align="center">${joint_financial_package}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Employer Super </th>    <td align="center">${employer_super}</td>    <td align="center">${s_employer_super}</td>  </tr><tr><th colspan="2" scope="row">Total Super </th><td align="center">${total_super}</td><td align="center">${s_total_super}</td></tr><tr>    <th colspan="2" scope="row">Reportable Employer Super Contribution (RESC)</td>    <td align="center">${resc}</td>    <td align="center">${s_resc}</td>  </tr>  <tr>    <th scope="row" colspan="2">Super Choice</th>    <td align="center">{super_fund}</td>    <td align="center">{s_super_fund}</td>  </tr>	<tpl if="additional_life_cover &gt; 0 || s_additional_life_cover &gt; 0">		<tr>		    <th colspan="2" scope="row">Amount of Additional Life Cover</th>		    <td align="center">${additional_life_cover}</td>		    <td align="center">${s_additional_life_cover}</td>		</tr>	</tpl>	<tr>		    <th colspan="2" scope="row">Additional Income Protection Premium paid from</th>		    <td align="center">{income_protection_cover_source}</td>		    <td align="center">{s_income_protection_cover_source}</td>		</tr>	  <tr>    <td colspan="4"><hr></td>  </tr><tpl if="housing &gt; 0">  <tr>    <th colspan="2" scope="row">Housing from Support Account</td>    <td align="center" colspan="2">${housing}</td>  </tr>  <tr>    <th scope="row" colspan="2">Additional Housing Allowance</th>    <td align="center" colspan="2">${additional_housing} is additional housing</td>  </tr>  <tr>    <th scope="row" colspan="2">Frequency of Housing Payments</th>    <td align="center" colspan="2">{housing_frequency}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr></tpl>  <tr>    <th colspan="2" scope="row">MMR</th>    <td align="center">${mmr}</td>    <td align="center">${s_mmr}</td>    </tr><tr>    <td colspan="4"><hr></td>  </tr><tpl if="total_transfers &gt; 0">	<tr>	    <th colspan="2" scope="row">Contribution Transfers: </th>	    <td align="center">Name</td>	    <td align="center">Amount</td>	</tr>	<tpl for="transfers">		<tr>		    <th colspan="2" scope="row"></th>		    <td align="center">{name}</td>		    <td align="center">${amount}</td>		</tr>	</tpl>	<tr>	    <td colspan="4"><hr></td>	</tr></tpl>  <tr>    <th colspan="2" scope="row">Total Contribution Transfers</th>    <td align="center" colspan="2">${total_transfers}</td>  </tr><tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Worker\'s Compensation</th>    <td align="center" colspan="2">${workers_comp}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr>				  <tr>		    <th colspan="2" scope="row">CCCA Levy</th>		    <td align="center" colspan="2">${ccca_levy}</td>		  </tr>		<tr>    <td colspan="4"><hr></td>  </tr>  <tr>    <th colspan="2" scope="row">Total Monthly Needs</th>    <td align="center" colspan="2">${tmn}</td>  </tr>  <tr>    <td colspan="4"><hr></td>  </tr> </table> <p>&nbsp;</p> <h2>Update Payment Methods</h2> <p>&nbsp;</p> <p><u>If your bank or credit card details have changed</u></p><p>Please record them below.</p><tpl if="housing &gt; 0"><p>&nbsp;</p><table width="100%">  <tr><td><h4>Housing Payments</h4></td>  <td><strong>Bank Account (preferred)</strong></td><td><strong>Cheque</strong></td>  </tr>  <tr><td>&nbsp;</td>  <td><p>Name on Account:</p>_____________________</td>  <td><p>Name on Cheque:</p>_____________________</td>  </tr>  <tr><td>&nbsp;</td>  <td valign="top"><p>BSB:</p>__ __ __ / __ __ __</td>  <td><p>Postal Address:</p>_____________________<p>_______________________</p></td>  </tr>  <tr><td>&nbsp;</td>  <td><p>Account Number:</p>_____________________</td>  <td><p>Reference (if needed):</p>_____________________</td>  </tr>  </table></tpl><br><p>Record your credit card details, but only if they have changed.</p> <table width="100%">	<tr><td valign="top"><h4>Bank Account</h4></td>    <td valign="top"><p>Name on Account</p>      <p><br>    ______________________________</p></td></tr>    <tr><td valign="top"><p>BSB</p>      <p><br>    __ __ __ /__ __ __</p></td>    <td valign="top"><p>Account Number</p>      <p><br>    _______________________________</p></td></tr>	</table>	 <p>&nbsp;</p>	<table width="100%">      <tr>        <td valign="top"><h4>Credit Card</h4></td>        <td valign="top"><p>Name on Card</p>          <p><br>          ______________________________</p></td></tr>        <tr><td valign="top"><p>Financial Institution</p>          <p><br>          ______________________________</p></td>        <td valign="top"><p><br>          <input type="checkbox" name="checkbox" value="checkbox">              Visa<br>              <input type="checkbox" name="checkbox" value="checkbox">          MasterCard</p>          </td>		</tr><tr>        <td valign="top"><p>BPay Reference Number (this may or may not be your card number):</p>          <p><br>          __ __ __ __ - __ __ __ __ - __ __ __ __ - __ __ __ __</p></td>        <td valign="top"><p>BPay Biller Code:</p>          <p><br>          __ __ __ __ - __ __ __ __</p></td>      </tr>    </table>  <p>&nbsp;</p><h4>Authorisation<tpl if="auth_lv2"><br/> - your TMN must be approved by your NML because:	<tpl for="auth_lv2_reasons">		<br/> &nbsp;&nbsp;&nbsp;&nbsp;- {reason}	</tpl></tpl><tpl if="auth_lv3"><br/> - Your TMN must be approved by your MGL because:	<tpl for="auth_lv3_reasons">		<br/> &nbsp;&nbsp;&nbsp;&nbsp;- {reason}	</tpl></tpl></h4><table><tr><td>Signature: _________________________________________________________</td><td>Date: ___________________</td></tr><tpl if="auth_lv1"><tr><td colspan="2"><p>&nbsp;</p></td></tr><tr><td>Ministry Overseer Signature: _________________________________________________________</td><td>Date: ___________________</td></tr></tpl><tpl if="auth_lv2"><tr><td colspan="2"><P>&nbsp;</P></td></tr><tr><td>National Ministry Leader Signature: _________________________________________________________</td><td>Date: ___________________</td></tr></tpl><tpl if="auth_lv3"<tr><td colspan="2"><P>&nbsp;</P></td></tr><tr><td>Ministry Group Leader Signature: _________________________________________________________</td><td>Date: ___________________</td></tr></tpl></table><p align="right">Revision Date: 1/04/2010</p>'
		);
			
		if (values['s_firstname'] == null){
			single_tpl.overwrite(this.body, values);
		} else {
			spouse_tpl.overwrite(this.body, values);
		}
		
		if (successCallback !== undefined) successCallback();
	},
	
	//required function do not edit unless you know what you are doing
	submitForm: function (successCallback, failureCallback) {
		//print it
		if (Ext.isChrome)
			window.print();
		else
			Ext.ux.Printer.print(this);
			
		//save the submitted json object
		Ext.Ajax.request({
			url: 'php/submit_tmn.php',
			params: {
				session: this.session,
				json: this.response
			}
		});
		
		//enable buttons again
		failureCallback();
	}
	
}); //eo extend

Ext.reg('view_tmn', TMN.ViewPanel); //change test_form to appropriate name and change Form to match above name (ln 4)

