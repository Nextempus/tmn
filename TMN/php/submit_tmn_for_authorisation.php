<?php
include_once 'classes/Tmn.php';
include_once 'classes/TmnAuthorisationProcessor.php';
include_once 'classes/TmnCrudSession.php';
include_once('classes/TmnConstants.php');

//add constants to extra data (will be appended to data before its saved)
$e_data = getConstants(array("VERSIONNUMBER"));
$extra_data	= array();
foreach ($e_data as $key=>$value) {
	$extra_data[strtolower($key)]	= $value;
}

$logfile = 'logs/submit_tmn_for_authorisation.php.log';
try {
	$tmn = new Tmn($logfile);
	//$tmn->authenticate();
	//Authenticate
	if ($tmn->isAuthenticated()) {
		if (isset($_POST['authorisers']) && isset($_POST['data'])) {
			if(get_magic_quotes_gpc()) {
				$authorisers_string = stripslashes($_POST['authorisers']);
				$data_string = stripslashes($_POST['data']);
	        } else {
	        	$authorisers_string = $_POST['authorisers'];
	        	$data_string = $_POST['data'];
			}
			
			//grab session id
			$session_id		= $_POST['session'];
	               
			//decode authorisers
			$authorisers	= json_decode($authorisers_string, true);
			//decode data
			$data			= json_decode($data_string, true);
			
			//create a TmnAuthorisationProcessor object authsessionid is null because it hasn't been submitted yet
			$session = new TmnCrudSession($logfile, $session_id);
			
			if ($session->getField('auth_session_id') == null) {
				//set up the auth users
				$authlevel1 = new TmnCrudUser($logfile, $authorisers['level_1']['user_id']);
				if ($authorisers['level_2']['user_id'] != 0) {
					$authlevel2 = new TmnCrudUser($logfile, $authorisers['level_2']['user_id']);
				}
				if ($authorisers['level_3']['user_id'] != 0) {
					$authlevel3 = new TmnCrudUser($logfile, $authorisers['level_3']['user_id']);
				}
				
				if ($session->getField("home_assignment_session_id") == null && $session->getField("international_assignment_session_id") == null) {
					
					//prepare the reasons variables submittion
					if (count($authorisers['level_1']['reasons']) == 0) {
						$authorisers['level_1']['reasons']	= array('aussie-based'=>array('reasons' => array()));
					}
					if (count($authorisers['level_2']['reasons']) == 0) {
						$authorisers['level_2']['reasons']	= array('aussie-based'=>array('reasons' => array()));
					}
					if (count($authorisers['level_3']['reasons']) == 0) {
						$authorisers['level_3']['reasons']	= array('aussie-based'=>array('reasons' => array()));
					}
					$authorisers['level_1']['reasons']['aussie-based']['reasons'] 				= array_merge($authorisers['level_3']['reasons']['aussie-based']['reasons'], $authorisers['level_2']['reasons']['aussie-based']['reasons'], $authorisers['level_1']['reasons']['aussie-based']['reasons']);
					$reasonsu 	= $authorisers['level_1']['reasons'];
					$reasons1 	= $authorisers['level_1']['reasons'];
					$authorisers['level_2']['reasons']['aussie-based']['reasons'] 				= array_merge($authorisers['level_3']['reasons']['aussie-based']['reasons'], $authorisers['level_2']['reasons']['aussie-based']['reasons']);
					$reasons2	= $authorisers['level_2']['reasons'];
					$reasons3 	= $authorisers['level_3']['reasons'];
					
					//update session with new data
					$data['aussie-based']	= array_merge($data['aussie-based'], $extra_data);
					$session->loadDataFromAssocArray($data['aussie-based']);
					$session->setField('session_id', (int)$session_id);
					$session->setOwner($tmn->getUser());
					$session->update();
				} else {
					if (count($authorisers['level_1']['reasons']) == 0) {
						$authorisers['level_1']['reasons']	= array('home-assignment'=>array('reasons' => array()), 'international-assignment'=>array('reasons' => array()));
					}
					if (count($authorisers['level_2']['reasons']) == 0) {
						$authorisers['level_2']['reasons']	= array('home-assignment'=>array('reasons' => array()), 'international-assignment'=>array('reasons' => array()));
					}
					if (count($authorisers['level_3']['reasons']) == 0) {
						$authorisers['level_3']['reasons']	= array('home-assignment'=>array('reasons' => array()), 'international-assignment'=>array('reasons' => array()));
					}
					$authorisers['level_1']['reasons']['home-assignment']['reasons'] 			= array_merge($authorisers['level_3']['reasons']['home-assignment']['reasons'], $authorisers['level_2']['reasons']['home-assignment']['reasons'], $authorisers['level_1']['reasons']['home-assignment']['reasons']);
					$authorisers['level_1']['reasons']['international-assignment']['reasons'] 	= array_merge($authorisers['level_3']['reasons']['international-assignment']['reasons'], $authorisers['level_2']['reasons']['international-assignment']['reasons'], $authorisers['level_1']['reasons']['international-assignment']['reasons']);
					$reasonsu 	= $authorisers['level_1']['reasons'];
					$reasons1 	= $authorisers['level_1']['reasons'];
					$authorisers['level_2']['reasons']['home-assignment']['reasons'] 			= array_merge($authorisers['level_3']['reasons']['home-assignment']['reasons'], $authorisers['level_2']['reasons']['home-assignment']['reasons']);
					$authorisers['level_2']['reasons']['international-assignment']['reasons'] 	= array_merge($authorisers['level_3']['reasons']['international-assignment']['reasons'], $authorisers['level_2']['reasons']['international-assignment']['reasons']);
					$reasons2	= $authorisers['level_2']['reasons'];
					$reasons3 	= $authorisers['level_3']['reasons'];
					
					//grab session details if its an international assignment session
					if ($session->getField("international_assignment_session_id") == null) {
						$ia_session		= $session;
						$ia_session_id	= $ia_session->getField('session_id');
						$ha_session		= $session->getHomeAssignment();
						$ha_session_id	= $ha_session->getField('session_id');
					}
					
					//grab session details if its an home assignment session
					if ($session->getField("home_assignment_session_id") == null) {
						$ia_session		= $session->getInternationalAssignment();
						$ia_session_id	= $ia_session->getField('session_id');
						$ha_session		= $session;
						$ha_session_id	= $ha_session->getField('session_id');
					}
					
					//update session with new data for international assignment
					$data['international-assignment']	= array_merge($data['international-assignment'], $extra_data);
					$ia_session->loadDataFromAssocArray($data['international-assignment']);
					$ia_session->setField('session_id', (int)$ia_session_id);
					$ia_session->setOwner($tmn->getUser());
					$ia_session->update();
					
					//update session with new data for home assignment
					$data['home-assignment']	= array_merge($data['home-assignment'], $extra_data);
					$ha_session->loadDataFromAssocArray($data['home-assignment']);
					$ha_session->setField('session_id', (int)$ha_session_id);
					$ha_session->setOwner($tmn->getUser());
					$ha_session->update();
				}
					
				//pass the auth data to submit()
				echo json_encode($session->submit($tmn->getUser(), $reasonsu, $authlevel1, $reasons1, $authlevel2, $reasons2, $authlevel3, $reasons3));
			} else {
				echo json_encode(array('success' => false, 'locked' => true, 'alert' => 'Sorry, you can\'t resubmit a session. If you would like to submit a TMN with the same numbers go back a page and click "Save As", this will create a new session with the same numbers which you can submit for authorisation.'));
			}
		}
		
	}
} catch (Exception $e) {
	Reporter::newInstance($logfile)->exceptionHandler($e);
}











































?>