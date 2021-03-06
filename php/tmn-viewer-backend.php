<?php
$DEBUG = 1;

include_once "dbconnect.php";
include_once "logger.php";
include_once("FinancialSubmitter.php");
if($DEBUG) require_once("../lib/FirePHPCore/fb.php");

//Authenticate the user in GCX with phpCAS
include_once('../lib/cas/cas.php');		//include the CAS module
if ( !isset($CAS_CLIENT_CALLED) ) {
	phpCAS::client(CAS_VERSION_2_0,'thekey.me',443,'cas');	//initialise phpCAS
	$CAS_CLIENT_CALLED = 1;
}
if (!phpCAS::isAuthenticated()) //if your not logged into gcx quit
	die('{success: false}');

if($DEBUG) ob_start();		//enable firephp logging

if (isset($_SESSION['phpCAS'])) {
	$xmlstr = str_replace("cas:", "", $_SESSION['phpCAS']['serviceResponse']);
	$xmlobject = new SimpleXmlElement($xmlstr);
	$guid = $xmlobject->authenticationSuccess->attributes->ssoGuid;
}

$connection = db_connect();
$LOGFILE = "logs/tmn-viewer-backend.log";

if (!isset($_POST["mode"]))
	die('{"success": false}');

if ($_POST["mode"] == "load") {
	$rows = "SELECT SESSION_ID, SESSION_NAME FROM Sessions";
	$rows = mysql_query($rows);
	$returndata = "";
	
	for ($i = 0; $i < mysql_num_rows($rows); $i++) {
		$r = mysql_fetch_assoc($rows);
		$returndata .= "{";
		foreach ($r as $k=>$v) {
			$returndata .= "\"".$k."\": \"".$r[$k]."\",";
		}
		$returndata = trim($returndata, ",");
		$returndata .= "},";
	}
	
	$returndata = trim($returndata,",");
	
	echo '{"data":['.$returndata.'] }';
} else if ($_POST["mode"] == "get") {
	//return the user's submitted json packet
	$rows = "SELECT JSON FROM Sessions WHERE SESSION_ID=".$_POST["session"];
	$rows = mysql_query($rows);
	$row = mysql_fetch_assoc($rows);
	echo '{"success": true, "tmn_data": '.$row["JSON"].'}';
} else if ($_POST["mode"] == "reprocess") {
	//grab the user's submitted json packet
	$rows = "SELECT JSON FROM Sessions WHERE SESSION_ID=".$_POST["session"];
	if ($DEBUG) fb($rows);
	$rows = mysql_query($rows);
	$row = mysql_fetch_assoc($rows);
	$data = json_decode($row["JSON"], true);
	
	if (isset($data["success"])) {						//if its an aussie based misso only (ie TMN 2.0) tmn packet
	if ($DEBUG) fb('old tmn');
		$data = $data["tmn_data"];							//grab the data
		$data["session"] = $_POST["session"];				//add the session to it
		
		$fs = new FinancialSubmitter($data, $DEBUG);
		echo $fs->submit();									//return the processed values
		
	} else if (isset($data["aussie-based"])) {			//if its a TMN 2.1 packet and they are an aussie based missio
	if ($DEBUG) fb('aussie tmn');
		$data = $data["aussie-based"];						//grab their data
		foreach ($data as $key => $value){					//convert the field names to uppercase (needed for processing)
			$upper_data[strtoupper($key)] = $value;
		}
		$upper_data["session"] = $_POST["session"];			//add the session to the data
		
		$fs = new FinancialSubmitter($upper_data, $DEBUG);
		$response = $fs->submit();							//grab the response of the submittion process
		$obj = json_decode($response, true);
		if ($obj["success"] == "true" || $obj["success"] == true){	//if the reprocessing worked prepare a packet so that it looks like it came from the database
			$json["aussie-based"] = $obj["tmn_data"];					//put the data into an associative array field called aussie-based
			
			$return["success"] = true;									//add a success field to the return packet
			$return["tmn_data"] = $json;								//copy the json field into the return packet
			echo json_encode($return);									//return the encoded packet
		} else {
			echo $home_response;									//if it failed stop here and return the errors
		}
	} else if (isset($data["international-assignment"]) && isset($data["home-assignment"])) {
	if ($DEBUG) fb('overseas tmn');							//if its a TMN 2.1 packet and they are an aussie based missio
		$home_data = $data["home-assignment"];					//grab their home assignment data
		foreach ($home_data as $key => $value){					//convert the field names to uppercase (needed for processing)
			$upper_home_data[strtoupper($key)] = $value;
		}
		$upper_home_data["session"] = $_POST["session"];		//add the session to the data
		
		$home_fs = new FinancialSubmitter($upper_home_data, $DEBUG);
		$home_response = $home_fs->submit();					//process it
		$home_obj = json_decode($home_response, true);
		if ($home_obj["success"] == "true" || $home_obj["success"] == true){
			$json["home-assignment"] = $home_obj["tmn_data"];	//if it worked, put the data into an associative array field called home-assignment
		} else {
			die($home_response);								//if it failed stop here and return the errors
		}
		
		$international_data = $data["international-assignment"];	//grab their international assignment data
		foreach ($international_data as $key => $value){						//convert the field names to uppercase (needed for processing)
			$upper_international_data[strtoupper($key)] = $value;
		}
		$upper_international_data["session"] = $_POST["session"];				//add the session to the data
		
	if ($DEBUG) fb($upper_international_data);
		$international_fs = new FinancialSubmitter($upper_international_data, $DEBUG);
		$international_response = $international_fs->submit();					//process it
		$international_obj = json_decode($international_response, true);
		if ($international_obj["success"] == "true" || $international_obj["success"] == true){
			$json["international-assignment"] = $international_obj["tmn_data"];	//if it worked, put the data into an associative array field called international-assignment
		} else {
			die($international_response);										//if it failed stop here and return the errors
		}
		
		$return["success"] = true;								//add a success field to the return packet
		$return["tmn_data"]= $json;								//copy the json field into the return packet
		
		echo json_encode($return);								//return the encoded packet
		
	} else {											//if their saved json packet doen't match one of these categrories tell the front end it failed
		echo '{"success": false}';
	}
} else {			//if its an invalid mode tell the front end it failed
	echo '{"success": false}';
}

?>