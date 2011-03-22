<?php

include_once('Reporter.php');
include_once('TmnCrudInterface.php');
include_once('TmnDatabase.php');

class TmnCrud extends Reporter implements TmnCrudInterface {
	
	
			///////////////////INSTANCE VARIABLES/////////////////////
	
	
	protected 			$db					= null;
	protected 		 	$table_name			= null;
	protected 			$primarykey_name	= null;
	protected 			$private_data		= array();
	protected 			$private_types		= array();
	protected 			$public_data		= array();
	protected 			$public_types		= array();
	
	
			///////////////////CONSTRUCTOR/////////////////////
	
	
	public function __construct($logfile, $tablename, $primarykey, $privatetypes, $publictypes) {
		
		parent::__construct($logfile);
		
		//configure table name
		if (isset($tablename)) {
			$this->table_name	=	$tablename;
		} else {
			throw new FatalException(__CLASS__ . " Exception: Configuration Error, Table name missing.");
		}
		
		//configure primary key
		if (isset($primarykey)) {
			$this->primarykey_name	=	$primarykey;
		} else {
			throw new FatalException(__CLASS__ . " Exception: Configuration Error, Primary Key missing.");
		}
		
		//setup data array's for private fields
		if (isset($privatetypes)) {
			foreach ($privatetypes as $key=>$value) {
				$this->private_data[$key]	= null;
				$this->private_types[$key]	= $value;
			}
		} else {
			throw new FatalException(__CLASS__ . " Exception: Configuration Error, Private Field's - Type Array is Missing.");
		}
		
		//setup data array's for public fields
		if (isset($publictypes)) {
			foreach ($publictypes as $key=>$value) {
				$this->public_data[$key]	= null;
				$this->public_types[$key]	= $value;
			}
		} else {
			throw new FatalException(__CLASS__ . " Exception: Configuration Error, Public Field's - Type Array is Missing.");
		}
		
		try {
			//grab an instance of the TmnDatabase
			$this->db	= TmnDatabase::getInstance($logfile);
			
		} catch (LightException $e) {
			//if there is a problem with the Database kill the object
			throw new FatalException(__CLASS__ . " Exception: Couldn't Connect to Database due to error; " . $e->getMessage());
		}
	}
	
	
			///////////////////CRUD FUNCTIONS/////////////////////
			
	
	public function create() {
		
		//init variables for generating query
		$data		= array_merge($this->private_data,$this->public_data);
		$types		= array_merge($this->private_types,$this->public_types);
		$sql		= "INSERT INTO `" . $this->table_name . "` (";
		
		//add the sql query the fields to be INSERTed into database
		foreach ($data as $key=>$value) {
			if ($value != NULL) {
				try {
					//check type of value before the field is added to the sql statement
					if ($this->valueMatchesType($data[$key], $types[$key])) {
						$sql					.=	"`" . strtoupper($key) . "`, ";
					}
				} catch (LightException $e) {
					$this->exceptionHandler($e);
				}
			}
		}
		
		//Note: sql should now have the form: INSERT INTO `<table name>` (<field name in uppercase>, ...
		
		$sql = trim($sql, ", ") . ") VALUES (";
		
		//check and add the values to the query
		foreach ($data as $key=>$value) {
			
			if ($value != NULL) {
				
				try {
					//check type of value before the field is added to the sql statement
					if ($this->valueMatchesType($data[$key], $types[$key])) {
						//make the variable in the form that the PDO prepared statement needs ie ":<field name>"
						$variableName			 =	":" . $key;
						//add this field's sql to the prepared statement in the form ":<field name>, "
						$sql					.=	$variableName . ", ";
						//add this field's value to the values array (will be bound to the prepared statement) will have form (':<field name>' => <value>)
						$values[$variableName]	 =	$data[$key];
					}
				} catch (LightException $e) {
					$this->exceptionHandler($e);
				}
			}
		}

		//remove extra ", " added by the loop
		$sql = trim($sql, ", ") . ")";
		
		//Note: sql should now have the form: INSERT INTO `<table name>` (<field name in uppercase>, ... ) VALUES (:<field name>, ... )
		
		//run the query
		try {
			//prepare the statement
			$stmt		= $this->db->prepare($sql);
			//bind and execute the statement
			$stmt->execute($values);
			
			//if the insert worked find which array the primary key is in
			if (isset($this->private_data[$this->primarykey_name])) {
				//update the value of the primary key
				$this->private_data[$this->primarykey_name] = $this->db->lastInsertId();
			} else {
				//update the value of the primary key
				$this->public_data[$this->primarykey_name] = $this->db->lastInsertId();
			}
			
		} catch (PDOException $e) {
			//if the INSERT didn't work, throw an exception
			throw new LightException(__CLASS__ . " Exception: " . $e->getMessage());
		}
	}
	
	public function retrieve() {
		
		//init variables for generating query
		$data		= array_merge($this->private_data,$this->public_data);
		$sql		= "SELECT ";
		$values		= array();
		
		//create the sql SELECT query
		foreach ($data as $key=>$value) {
			$sql	.=	"`" . strtoupper($key) . "`, ";
		}
		
		$sql			= trim($sql, ", ") . " FROM `" . $this->table_name . "` WHERE `" . strtoupper($this->primarykey_name) . "` = :" . $this->primarykey_name;
		$values[":" . $this->primarykey_name]	= $data[$this->primarykey_name];

		//run the query
		try {
			//prepare the statement
			$stmt		= $this->db->prepare($sql);
			//bind the values and execute the statement
			$stmt->execute($values);
			
			//grab result as an associative array
			$results		= $stmt->fetch(PDO::FETCH_ASSOC);
			
			//make sure only one row was pulled (it should be unique having used the primary key) throw exceptions if something went wrong
			if ($stmt->rowCount() == 0) {
				throw new LightException(__CLASS__ . " Exception: On Retrieve, User Not Found");
			} elseif ($stmt->rowCount() == 1) {
				
				//clear old values before the new ones are loaded in
				$this->reset();
				
				//copy results into the private instance variables
				foreach ($this->private_data as $key=>$value) {
					//for each private field see if there is a result to be loaded
					if (isset($results[strtoupper($key)])) {
						//if an int is expected convert the result from a string to an int
						$result = $results[strtoupper($key)];
						if ($this->private_types[$key] == "i") {$result = (int)$result;}
						
						//store the result
						$this->private_data[$key]	= $result;
					}
				}
				
				//copy results into the public instance variables
				foreach ($this->public_data as $key=>$value) {
					//for each public field see if there is a result to be loaded
					if (isset($results[strtoupper($key)])) {
						//if an int is expected convert the result from a string to an int
						$result = $results[strtoupper($key)];
						if ($this->public_types[$key] == "i") {$result = (int)$result;}
						
						//store the result
						$this->public_data[$key]	= $result;
					}
				}
				
			} else {
				throw new LightException(__CLASS__ . " Exception: User Conflict");
			}
			
		//if there was a problem with the statement then throw exceptions
		} catch (PDOException $e) {
			throw new LightException(__CLASS__ . " Exception: " . $e->getMessage());
		} catch (LightException $e) {
			throw $e;
		}
	}
	
	public function update() {
		
		//init variables for generating query
		$data				= array_merge($this->private_data,$this->public_data);
		$types				= array_merge($this->private_types,$this->public_types);
		$sql				= "UPDATE `" . $this->table_name . "` SET ";
		$values				= array();
		
		//check and add the values to the query
		foreach ($data as $key=>$value) {
			
			if ($value != NULL) {
				
				try {
					//check the fields type before adding it to the sql statement
					if ($this->valueMatchesType($data[$key], $types[$key])) {
						//make the variable in the form that the PDO prepared statement needs ie ":<field name>"
						$variableName			 =	":" . $key;
						//add this field's sql to the prepared statement in the form "`<field name in uppercase>` = :<field name>"
						$sql					.= "`" . strtoupper($key) . "` = " . $variableName . ", ";
						//add this field's value to the values array (will be bound to the prepared statement) will have form (':<field name>' => <value>)
						$values[$variableName]	 =	$data[$key];
					}
				} catch (LightException $e) {
					$this->exceptionHandler($e);
				}
			}
		}
		
		//remove extra ", " added by loop
		$sql				 = trim($sql, ", ");
		//add the condition to the sql statment, will have form "WHERE `<primary key name in uppercase>` = :<primary key name>"
		$sql				.= " WHERE `" . strtoupper($this->primarykey_name) . "` = :" . $this->primarykey_name;
		//add this primary key's value to the values array (will be bound to the prepared statement)
		$values[":" . $this->primarykey_name]	= $data[$this->primarykey_name];
		
		//Note: sql should now have form - UPDATE `<table name>` SET `<field name in uppercase>` = :<field name>, ... WHERE `<primary key name in uppercase>` = :<primary key name>

		//run the query
		try {
			//prepare the statement
			$stmt			 = $this->db->prepare($sql);
			//bind the values to the statement then execute it
			$stmt->execute($values);
		} catch (PDOException $e) {
			throw new LightException(__CLASS__ . " Exception: " . $e->getMessage());
		}
	}
	
	public function delete() {
		
		//init query
		$data									= array_merge($this->private_data, $this->public_data);
		$sql									= "DELETE FROM `" . $this->table_name . "` WHERE `" . strtoupper($this->primarykey_name) . "` = :" . $this->primarykey_name;
		$values[":" . $this->primarykey_name]	= $data[$this->primarykey_name];
		
		//Note: sql should now have form - DELETE FROM `<table name>` WHERE `<primary key name in uppercase>` = :<primary key name>
		
		//run the query
		try {
			//prepare the statement
			$stmt				= $this->db->prepare($sql);
			//bind the values to the statement then execute it
			$stmt->execute($values);
			//if the delete worked and didn't throw and exception then clear the data from the object
			$this->reset();
		} catch (PDOException $e) {
			throw new LightException(__CLASS__ . " Exception: " . $e->getMessage());
		}
	}
	
	
	////////////////////////////JSON FUNCTIONS////////////////////////////
	
	
	public function produceJson() {
		
		$data = array();
		//grab all non null fields
		foreach ($this->public_data as $key=>$value) {
			if ($value != null) {
				$data[$key] = $value;
			}
		}
		
		//return those fields as a json encoded string
		return json_encode($data);
	}
	
	public function loadDataFromJsonString($string) {
		//parse json string
		$jsonObj	= json_decode($string, true);
		
		//check if it parsed and returned a data object
		if (isset($jsonObj['data'])) {
			//check to see if the data object has an array of data to be loaded
			if (is_array($jsonObj['data'])) {
				//if there is data then load it
				$this->loadDataFromAssocArray($jsonObj['data']);
			} else {
				throw new LightException(__CLASS__ . " Exception: No Data in JSON String");
			}
		} else {
			throw new LightException(__CLASS__ . " Exception: JSON String could not be parsed");
		}
	}
	
	public function loadDataFromAssocArray($array) {
		foreach ($this->private_data as $key=>$value) {
			//check if their is data for this private field
			if (isset($array[$key])) {
				//check type
				try {
					if ($this->valueMatchesType($array[$key], $this->private_types[$key])) {
						//set the field if the type is correct
						$this->private_data[$key] = $array[$key];
					}
				} catch (Exception $e) {
					$this->exceptionHandler($e);
				}
			} else {
				//if there is no data then reset its value to null
				$this->private_data[$key] = null;
			}
		}
		
		foreach ($this->public_data as $key=>$value) {
			//check if their is data for this private field
			if (isset($array[$key])) {
				//check type
				try {
					if ($this->valueMatchesType($array[$key], $this->public_types[$key])) {
						//set the field if the type is correct
						$this->public_data[$key] = $array[$key];
					}
				} catch (Exception $e) {
					$this->exceptionHandler($e);
				}
			} else {
				//if there is no data then reset its value to null
				$this->public_data[$key] = null;
			}
		}
	}
	
	
	////////////////////////////EXTRA FUNCTIONS///////////////////////////
	
	
	public function reset() {
		//go through all private fields setting their values to null
		foreach ($this->private_data as $key=>$value) {
			$this->private_data[$key] = null;
		}
		
		//go through all public fields setting their values to null
		foreach ($this->public_data as $key=>$value) {
			$this->public_data[$key] = null;
		}
	}
	
	
	//type checks the fields for the user and throws an exception if anything is wrong
	public function valueMatchesType($value, $type) {
		
		//for each possible type run appropriate type checking
		switch ($type) {
			case 's':
				if (!is_string($value)) {
					//if type check fails throw exception
					throw new LightException(__CLASS__ . " Exception: Type mismatch. " . $value . " should be of type: String");
				}
			break;
			case 'i':
				if (!is_int($value)) {
					throw new LightException(__CLASS__ . " Exception: Type mismatch. " . $value . " should be of type: Integer");
				}
			break;
			case 'n':
				if (!is_null($value)) {
					throw new LightException(__CLASS__ . " Exception: Type mismatch. " . $value . " should be of type: NULL");
				}
			break;
			case 'b':
				if (!is_bool($value)) {
					throw new LightException(__CLASS__ . " Exception: Type mismatch. " . $value . " should be of type: Bool");
				}
			break;
			case 'l':
			break;
			
			default:
				throw new LightException("User Exception: Unable to check type; " . $type . " is not a known type.");
			break;
		}
		
		//if it makes it through the type check return true
		return true;
	}
	
	
			///////////////////DESTRUCTOR/////////////////////
	
	
	public function __destruct() {
		parent::__destruct();
	}
	
}

//This is an example of how to subclass TmnCrud
class TmnCrudUser extends TmnCrud {
	
	public function __construct($logfile, $tablename=null, $primarykey=null, $privatetypes=null, $publictypes=null) {
		
		parent::__construct(
			$logfile,						//path of logfile
			"User_Profiles",				//name of table
			"guid",							//name of table's primary key
			array(							//an assoc array of private field names and there types
				'guid'		=>	"s"
			),
			array(							//an assoc array of public field names and there types
				'firstname'		=>	"s",
				'surname'		=>	"s",
				'spouse_guid'	=>	"s",
				'ministry'		=>	"s",
				'ft_pt_os'		=>	"i",
				'days_per_week'	=>	"i",
				'fin_acc_num'	=>	"i",
				'mpd'			=>	"i",
				'm_guid'		=>	"s",
				'admin_tab'		=>	"i"
			)
		);
	}
}

?>