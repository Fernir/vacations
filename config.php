<?php

header("Content-type: text/html; charset=UTF-8"); 

$con = mysql_connect("mydb.mysql", "root", "password") or die (mysql_error());

if (!mysql_select_db("mydb")) include_once('patch.php');

error_reporting(1);
session_start();

global $months;
$months = array('Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь');

$_ADMINS = array();
$res = mysql_query("select * from users");
while($ret=mysql_fetch_array($res, MYSQL_ASSOC))
	if ($ret[access]=='1') $_ADMINS[] = $ret[name];

$_ADMINS[] = 'nalekseev';

mysql_free_result($res);

if (!$_SESSION[user]){
	require_once 'openid.php';
	$openid = new LightOpenID((!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']);
	$openid->identity = 'https://openid.corp.hostcomm.ru/';
	if(!$openid->mode) header('Location: ' . $openid->authUrl());
	if($openid->validate() == 1) {
	  	$out = $openid->data;
	  	if (!empty($out['openid_identity'])){
	  		preg_match('#idpage/?\?user=(.+)$#is', urldecode($out['openid_identity']), $matches);
			$_SESSION[user] = $matches[1];
		}
	}
}

$isAdmin = in_array($_SESSION[user], $_ADMINS);

?>