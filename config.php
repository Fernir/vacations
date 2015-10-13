<?php
error_reporting(1);
session_start();

//$con = mysql_connect("maynila.mysql", "maynila_taskrate", "kwhqilhc") or die (mysql_error());
//$db = mysql_select_db("maynila_taskrate") or die (mysql_error());

$con = mysql_connect("localhost", "root", "") or die (mysql_error());
$db = mysql_select_db("vacations.mysql") or die (mysql_error());
global $months;
$months = array('Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь');

?>