<?php
if(file_exists('../classes/TmnDatabase.php')) {
    include_once('../classes/TmnDatabase.php');
}
if(file_exists('classes/TmnDatabase.php')) {
    include_once('classes/TmnDatabase.php');
}
if(file_exists('php/classes/TmnDatabase.php')) {
    include_once('php/classes/TmnDatabase.php');
}

class TmnFinancialUnit {


    ///////////////////INSTANCE VARIABLES/////////////////////


    protected 	$db		                    = null;
    protected   $people                     = Array();
    public      $financial_account_number   = 0;
    public      $last_tmn_effective_date    = null;
    private     $authoriser_guid_array      = array();
    private     $authoriser_array           = array();

	public function __construct($logfile, $data) {
		
		if (is_array($data)) {

            if(isset($data['TMN_EFFECTIVE_DATE'])) {
                $this->tmn_effective_date   = new DateTime($data['TMN_EFFECTIVE_DATE']);
            }

            if(isset($data['FIN_ACC_NUM'])) {
                $this->financial_account_number = $data['FIN_ACC_NUM'];
            }

            if(isset($data['AUTH_LEVEL_1'])) {
                $this->auth_guid_array[1] = $data['AUTH_LEVEL_1'];
            }

            if(isset($data['AUTH_LEVEL_2'])) {
                $this->auth_guid_array[2] = $data['AUTH_LEVEL_2'];
            }

            if(isset($data['AUTH_LEVEL_3'])) {
                $this->auth_guid_array[3] = $data['AUTH_LEVEL_3'];
            }

		}

        try {
            //grab an instance of the TmnDatabase
            $this->db	= TmnDatabase::getInstance($logfile);

        } catch (LightException $e) {
            //if there is a problem with the Database kill the object
            throw new FatalException(__CLASS__ . " Exception: Couldn't Connect to Database due to error; " . $e->getMessage());
        }
		
	}

    public static function getActiveFinancialUnits($logfile) {

        $db             = null;
        try {
            $db         = TmnDatabase::getInstance($logfile);
        } catch (LightException $e) {
            //if there is a problem with the Database kill the object
            throw new FatalException(__CLASS__ . " Exception: Couldn't Connect to Database due to error; " . $e->getMessage());
        }
		$fanSql			= "SELECT low.* FROM User_Profiles AS users LEFT JOIN Low_Account AS low ON users.FIN_ACC_NUM=low.FIN_ACC_NUM WHERE users.INACTIVE = 0 AND users.EXEMPT_FROM_TMN = 0 AND users.IS_TEST_USER = 0";
		$stmt 			= $db->prepare($fanSql);
		$fanResult		= $stmt->fetchAll(PDO::FETCH_ASSOC);
		$returnArray	= array();

		foreach ($fanResult as $row) {

            $financialUnit      = NULL;

            if (isset( $returnArray[$row["FIN_ACC_NUM"]] )) {
                $financialUnit  = $returnArray[$row["FIN_ACC_NUM"]];
            } else {
                $financialUnit  = new TmnFinancialUnit($logfile, $row);
            }

            $person = new TmnCrudUser($logfile);
            $person->loadDataFromAssocArray($row);
            $financialUnit->addPerson($person);

            $returnArray[$row["FIN_ACC_NUM"]] = $financialUnit;

        }

		return $returnArray;

    }

    public function addPerson($person) {

        if (is_a($person, "TmnCrudUser")) {

            array_push($this->people, $person);

        }

    }

    public function getMinistry() {

        $ministryString    = null;

        foreach ($this->people as $person) {

            if (!isset($ministryString) || $person->getField('MINISTRY') == "Student Life") {
                $ministryString = $person->getField('MINISTRY');
            }

        }

        return $ministryString;

    }

    public function getTmnsAwaitingApprovalSince($date) {

        $date           = ( isset($date) && is_a($date, "DateTime") ? $date : new DateTime() );
        $tmnSql			= "SELECT * FROM (SELECT * FROM Tmn_Sessions WHERE FAN = :financial_account_number AND AUTH_SESSION_ID IS NOT NULL) as sessions LEFT JOIN Auth_Table as auth ON sessions.AUTH_SESSION_ID = auth.AUTH_SESSION_ID WHERE auth.USER_TIMESTAMP > STR_TO_DATE(:date, '%Y-%m-%d %H:%i:%s') AND (auth.FINANCE_RESPONSE = 'Pending') AND (auth.USER_RESPONSE = 'Yes' OR auth.USER_RESPONSE = 'Pending') AND (auth.LEVEL_1_RESPONSE = 'Yes' OR auth.LEVEL_1_RESPONSE = 'Pending') AND (auth.LEVEL_2_RESPONSE = 'Yes' OR auth.LEVEL_1_RESPONSE = 'Pending') AND (auth.LEVEL_3_RESPONSE = 'Yes' OR auth.LEVEL_1_RESPONSE = 'Pending')";
        $values         = array( ":financial_account_number" => $this->financial_account_number, ":date" => $date->format("Y-m-d H:i:s") );
        $stmt 			= $this->db->prepare($tmnSql);
        $stmt->execute($values);
        $tmnResult		= $stmt->fetchAll(PDO::FETCH_ASSOC);
        $returnArray	= array();

        foreach ($tmnResult as $row) {

            $tmn = new TmnCrudSession($this->getLogfile());
            $tmn->loadDataFromAssocArray($row);
            array_push($returnArray, $tmn);

        }

        return $returnArray;
    }

    public function getAuthoriserEmailsForLevel(int $level = 0) {

        $level          = min($level, count($this->authoriser_array));
        $emailString    = "";

        for ($levelCount = 1; $levelCount <= $level; $levelCount) {

            if (!isset($this->authoriser_array[$levelCount])) {
                $this->authoriser_array[$levelCount] = new TmnCrudUser($this->getLogfile(), $this->authoriser_guid_array[$levelCount]);
            }

            $authoriser = $this->authoriser_array[$levelCount];

            $emailString .= $authoriser->getField('EMAIL') . ", ";
        }

        if (count($this->people) > 0) {
            $emailString    = substr($emailString, 0, -2);
        }

        return $emailString;

    }

    public function getEmails() {

        $emailString    = "";

        foreach ($this->people as $person) {

            $emailString .= $person->getField('EMAIL') . ", ";

        }

        if (count($this->people) > 0) {
            $emailString    = substr($emailString, 0, -2);
        }

        return $emailString;

    }

    public function getNames() {

        $nameString    = "";

        foreach ($this->people as $person) {

            $nameString .= $person->getField('FIRSTNAME') . " & ";

        }

        if (count($this->people) > 0) {
            $nameString    = substr($nameString, 0, -2) . $this->people[0]->getField('SURNAME');
        }

        return $nameString;

    }


}

?>