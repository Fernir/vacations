<?php
include_once("config.php");

//session_destroy();

$action = mysql_real_escape_string($_REQUEST[action]);
$name = mysql_real_escape_string($_REQUEST[name]);
$otdel_id = mysql_real_escape_string($_REQUEST[otdel_id]);
$editname = mysql_real_escape_string($_REQUEST[editname]);
$accessval = mysql_real_escape_string($_REQUEST[accessval]);
$checkvalue = mysql_real_escape_string($_REQUEST[checkvalue]);
$member_id = mysql_real_escape_string($_REQUEST[member_id]);
$user = "ann"; //$_SERVER["AUTHENTICATE_UID"];

if (mysql_real_escape_string($_REQUEST[id])){
	$_SESSION[id] = mysql_real_escape_string($_REQUEST[id]);
}else{
	if (!$_SESSION[id]) $_SESSION[id] = 1;
}

if (mysql_real_escape_string($_REQUEST[pid])){
	$_SESSION[pid] = mysql_real_escape_string($_REQUEST[pid]);
}else{
	if (!$_SESSION[pid]) $_SESSION[pid] = 1;
}

// ----- graph ------
global $isChecked;
$date = getdate();
if (!$_SESSION[year]) $_SESSION[year] = $date[year];
$add = strip_tags($_REQUEST[add]);
$otdel = strip_tags($_REQUEST[otdel]);
$unit = strip_tags($_REQUEST[unit]);
$index = $_SESSION[id] | strip_tags($_REQUEST[index]);
$id_graph = strip_tags($_REQUEST[id_graph]);
$member = strip_tags($_REQUEST[member]);
$setmember = strip_tags($_REQUEST[setmember]);
$deletemember = strip_tags($_REQUEST[deletemember]);
$deletepeople = strip_tags($_REQUEST[deletepeople]);
$movepeople = strip_tags($_REQUEST[movepeople]);
$storage = strip_tags($_REQUEST[storage]);
$data = strip_tags($_REQUEST[data]);
$nyear = strip_tags($_REQUEST[year]);
// ----- graph ------

$curindex = $index;
if (!$curindex) $curindex = $otdel;
$canedit = canEditThis($curindex);


$json = "";

//-------------------------------------------

function canEditThis($d){
	if ($_SESSION[admin]) return true;
	$res = mysql_query("select * from vacations_editors where otdel='$d'") or die (mysql_error());
	while($row = mysql_fetch_array($res, MYSQL_ASSOC)){
		if ($_SESSION[user]==$row[name]){
			mysql_free_result($res);
			return true;
		}
	}
	mysql_free_result($res);
	return false;
}

//----------------------------------------------

function updateData($yr){
	global $isChecked;
	$isChecked = array();
	$result = mysql_query("select * from vacations_storage");
	while($ret=mysql_fetch_array($result, MYSQL_ASSOC)){
		$isChecked[$ret[id]] = $ret;
	}
	mysql_free_result($result);
}

//-------------------------------------------

function otdels_departaments(){
	global $json;
	$row = mysql_fetch_array(mysql_query("select graph from vacations_otdels where id=$_SESSION[id]"), MYSQL_ASSOC);
	$json['graph'] = ($row[graph] == '1');
	
	if ($_SESSION[id]!=1){
		$json['breadcrumbs'] = array();
		$ret = mysql_fetch_array(mysql_query("select * from vacations_otdels where id = $_SESSION[id]"), MYSQL_ASSOC);
		while ($ret[id]){
			if ($ret[id] != $_SESSION[id]){
				$json['breadcrumbs'][] = array( id => $ret[id], text => $ret[name]);
			}
			$ret = mysql_fetch_array(mysql_query("select * from vacations_otdels where id = $ret[departament]"), MYSQL_ASSOC);
		}
		$json['breadcrumbs'][] = array( id => 1, text => 'На главную страницу');
		array_reverse($json['breadcrumbs']);
	}	
	
	$json['otdels'] = array();
	$result = mysql_query("select * from vacations_otdels where departament=$_SESSION[id]");
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$havechilds = mysql_fetch_array(mysql_query("select count(*) as count from vacations_otdels where departament=$row[id]"), MYSQL_ASSOC);
		$json['otdels'][] = array(
			id => $row[id],
			pid => $_SESSION[pid],
			childs => $havechilds[count],
			graph => $row[graph],
			name => $row[name],
		);
	}
	mysql_free_result($result);
}

//-------------------------------------------

function memberslist(){
	global $json;
	$json['members'] = array();
	$result = mysql_query("select * from vacations_members");
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$names = array();
		$res = mysql_query("select vacations_otdels.name from vacations_members left join vacations_editors on vacations_members.id=vacations_editors.uid left join vacations_otdels on vacations_otdels.id=vacations_editors.otdel where vacations_members.id=$row[id]");
		while($ret=mysql_fetch_array($res, MYSQL_ASSOC)){
			$names[] = $ret[name];
		}
		mysql_free_result($res);
		$json['members'][] = array(
			id => $row[id],
			name => $row[name],
			admin => $row[admin],
			otdels_edit => $names,
			access => $row[access],
		);
	}
	mysql_free_result($result);	
}

//------------------------------------------------------------

function dologin(){
	global $user;
	unset($_SESSION[editor]);
	unset($_SESSION[user]);
	unset($_SESSION[admin]);
	
	$_ADMINS = array();
	$_EDITORS = array();
	$res = mysql_query("select * from vacations_members where access!=0");
	while($ret=mysql_fetch_array($res, MYSQL_ASSOC)){ 
		if ($ret[access]=='1'){
			$_ADMINS[] = $ret[name];
		}
		if ($ret[access]=='2'){
			$_EDITORS[] = $ret[name]; 
		}
	}
	mysql_free_result($res);
	$IsAdmin = in_array($user, $_ADMINS);
	$IsEditor = in_array($user, $_EDITORS);

	if ($IsAdmin or $IsEditor){
		$_SESSION[user] = $user;
		$_SESSION[admin] = $IsAdmin;
		$_SESSION[editor] = $IsEditor;
	}
}

//-------------------------------------------

function drawCalendar($year) {
	global $index, $isChecked, $json, $months;
  	$first = 0;
	$json['rows'] = array();
	$json['graph_users'] = array();

	updateData();

	$q = mysql_query("select * from vacations_peoples left join vacations_pointers on vacations_peoples.id=vacations_pointers.uid where vacations_pointers.otdel='$index' order by vacations_peoples.name") or die (mysql_error());
	while($row = mysql_fetch_array($q, MYSQL_ASSOC)){
		$json['rows'][$row[id]] = array();
		$json['graph_users'][$row[id]] = $row[name];
		$matches = 
			preg_grep ("/".$row[id]."_".($year-1)."_(\d+)_(\d+)/", array_keys($isChecked)) + 
			preg_grep ("/".$row[id]."_".$year."_(\d+)_(\d+)/", array_keys($isChecked)) + 
			preg_grep ("/".$row[id]."_".($year+1)."_(\d+)_(\d+)/", array_keys($isChecked));
			
		while (list($key, $value) = each($matches)) {
			$json['rows'][$row[id]][$value] = $isChecked[$value][data];
		}		
	}
	mysql_free_result($q);
}

//-------------------------------------------

if ($canedit){
	if ($storage && $id_graph && $index && $unit && $data && $data !="" ){
		mysql_query("replace into vacations_storage (id, name, data, otdel, checked) values('$id_graph', '$unit', '".strip_tags($data)."', '$index', 1)") or die (mysql_error());
	} elseif ($storage && $id_graph && $index && $unit && $data==""){
		mysql_query("delete from vacations_storage where id='$id_graph'") or die (mysql_error());
	}
	
	
	if ($deletepeople && $member && $otdel && $unit){
		mysql_query("delete from vacations_pointers where uid='$member'") or die (mysql_error());
		mysql_query("delete from vacations_storage where name='$member'") or die (mysql_error());
		mysql_query("delete from vacations_peoples where id='$member' and otdel='$otdel'") or die (mysql_error());
	}
	
	if ($add && $unit && $index){
		mysql_query("insert ignore into vacations_peoples (otdel, name) values('$index', '$unit')") or die (mysql_error());
		$result = mysql_query("select id from vacations_peoples where name='$unit'") or die (mysql_error());
		$row = mysql_fetch_array($result, MYSQL_ASSOC);
		mysql_query("insert ignore into vacations_pointers (uid, name, otdel) values('$row[id]', '$unit', '$index')") or die (mysql_error());
		mysql_free_result($result);
	}
}

if ($_SESSION[admin]){
	if ($movepeople && $member && $otdel && $unit){
		mysql_query("delete from vacations_pointers where uid='$member'") or die (mysql_error());
		mysql_query("insert ignore into vacations_pointers (uid, name, otdel) values('$member', '$unit', '$otdel')") or die (mysql_error());
	}
	
	if ($setmember && $member && $otdel && $unit){
		mysql_query("replace into vacations_editors (uid, name, otdel) values('$member', '$unit', '$otdel')") or die (mysql_error());
	}
	
	if ($deletemember && $member && $otdel){
		mysql_query("delete from vacations_editors where uid='$member'") or die (mysql_error());
	}
}

//-------------------------------------------

if ($index && $index != 1){
	if ($nyear)	$_SESSION[year] = intval($_SESSION[year]) + intval($nyear);
	
	$json['editors'] = array();
	$result = mysql_query("select * from vacations_members where access!=1 order by binary(lower(name)) ASC") or die (mysql_error());
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$json['editors'][$row[id]] = $row[name];
	}
	mysql_free_result($result);

	$json['graph_editors'] = array();
	$result = mysql_query("select * from vacations_editors where otdel=$index order by name") or die (mysql_error());
	$names = array();
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$json['graph_editors'][$row[uid]] = $row[name];
	}
	mysql_free_result($result);
}

$json['move_to'] = array();
$ret = mysql_query("select * from vacations_otdels order by name");
while($row = mysql_fetch_array($ret, MYSQL_ASSOC)){
	$ret2 = mysql_query("select * from vacations_otdels order by name");
	$dval = false;
	$popval = 0;
	while($row2 = mysql_fetch_array($ret2, MYSQL_ASSOC)){
		if ($row2[id]==$row[departament] || $row[departament]==1)
			$dval = true;
		if ($row[departament]==$row[id])
			$popval = $row[id];
		if ($popval > 0 && ($row[departament]==$popval || $row[id]==$popval))
			$dval = false;
	}
	if ($dval){
		$json['move_to'][$row[id]] = $row[name];
	}
	mysql_free_result($ret2);
}
mysql_free_result($ret);


if (($user!="" && $user!=$_SESSION[user]) || !$_SESSION[user]) dologin();

switch($action){
	case "delete_departament":
		if ($_SESSION[admin]){
			if ($_SESSION[id]){
				$result=mysql_query("select id from vacations_otdels where departament=$_SESSION[id]");
				$row = mysql_fetch_array($result, MYSQL_ASSOC);
				mysql_query("delete from vacations_editors where otdel='$row[id]'") or die (mysql_error());
				mysql_query("delete from vacations_storage where otdel='$row[id]'") or die (mysql_error());
				mysql_query("delete from vacations_pointers where otdel='$row[id]'");
				mysql_query("delete from vacations_peoples where otdel='$row[id]'") or die (mysql_error());
				mysql_query("delete from vacations_otdels where id='$row[id]'") or die (mysql_error());
				mysql_query("delete from vacations_otdels where departament=$_SESSION[id]") or die (mysql_error());
				mysql_query("delete from vacations_departaments where id=$_SESSION[id]") or die (mysql_error());
				mysql_free_result($result);
			}
		}
		break;

	// otdels
	case "nav":
		$_SESSION[view] = 'nav';
		break;
	
	case "new_otdel":
		if ($_SESSION[admin]){
			if ($otdel_id){
				mysql_query("insert ignore into vacations_otdels (name, departament) values('Новый отдел', $otdel_id)") or die (mysql_error());
			} else {
				mysql_query("insert ignore into vacations_otdels (name, departament) values('Новый отдел', '1')") or die (mysql_error());
			}
		}
		break;

	case "edit_otdel":
		if ($_SESSION[admin]){
			if ($otdel_id && $editname && $editname != ''){
				mysql_query("update vacations_otdels set name = '$editname' where id=$otdel_id") or die (mysql_error());
			}
		}
		break;

	case "toggle":
		if ($_SESSION[admin]){
			if ($_SESSION[id]){
				mysql_query("update vacations_otdels set graph=".($checkvalue=='false' ? 1:0)." where id=$_SESSION[id]") or die (mysql_error());
			}
		}
		break;

	case "delete_otdel":
		if ($_SESSION[admin]){
			if ($otdel_id){
				mysql_query("delete from vacations_editors where otdel='$otdel_id'") or die (mysql_error());
				mysql_query("delete from vacations_storage where otdel='$otdel_id'") or die (mysql_error());
				mysql_query("delete from vacations_pointers where otdel='$otdel_id'");
				mysql_query("delete from vacations_peoples where otdel='$otdel_id'") or die (mysql_error());
				mysql_query("delete from vacations_otdels where departament='$otdel_id'") or die (mysql_error());
				mysql_query("delete from vacations_otdels where id='$otdel_id'") or die (mysql_error());
			}
		}
		break;

	case "members":
		$_SESSION[view] = 'members';
		break;

	case "delete_member":
		if ($_SESSION[admin]){
			if ($member_id){
				mysql_query("delete from vacations_editors where vacations_editors.uid=$member_id") or die (mysql_error());
				mysql_query("delete from vacations_members where id=$member_id and access!='1'") or die (mysql_error());
			}
		}
		break;

	case "access_member":
		if ($_SESSION[admin]){
			if ($member_id && $accessval!=""){
				mysql_query("update vacations_members set access='$accessval' where id=$member_id") or die (mysql_error());
			}
		}
		break;

	case "add_member":
		if ($_SESSION[admin]){
			if ($name!=""){
				mysql_query("insert ignore vacations_members set name='$name'") or die (mysql_error());
			}
		}
		break;
}

if ($_SESSION[view] == 'nav'){
	drawCalendar($_SESSION[year]);
	otdels_departaments();
}else if($_SESSION[view] == 'members'){
	memberslist();
}

$json['user'] = $_SESSION[user];
$json['admin'] = $_SESSION[admin];
$json['editor'] = $_SESSION[editor];
$json['id'] = $_SESSION[id];
$json['pid'] = $_SESSION[pid];
$json['view'] = $_SESSION[view];
$json['index'] = $index;
$json['year'] = $_SESSION[year];


header("Content-type: text/javascript; charset=UTF-8"); 
echo preg_replace( "/:\"(\d+)\"/", ':$1', json_encode($json));

mysql_close($con); 
?>