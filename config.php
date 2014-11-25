<?php
error_reporting(1);
session_start();

$con = mysql_connect("localhost", "root", "") or die (mysql_error());
$db = mysql_select_db("vacations.mysql") or die (mysql_error());
global $months;
$months = array('Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь');

?>