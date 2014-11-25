<?php header("Content-type: text/html; charset=UTF-8"); ?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<link rel="stylesheet" href="style/jquery_ui.css" type="text/css" />
<link rel="stylesheet" href="style/style.css" type="text/css" />
<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/jquery_ui.js"></script>
<script type="text/javascript" src="js/dot.js"></script>
<script type="text/javascript" src="js/datetime.js"></script>
<script type="text/javascript" src="js/functions.js"></script>
<title>Графики отпусков</title>
</head>
<body>
<noscript>
<h1 style="margin-top:20%; font-size:200%; text-align:center;">График отпусков:<br>
  приложение работает только при поддержке JavaScript</h1>
</noscript>
<div id="container"></div>
<div id="msgbox" style="display:none;">
  <textarea id="msgboxval" style="width:97%; height:90%; padding:5px; resize: none;"></textarea>
</div>
<div id="prompt" style="display:none;"></div>
<div id="moveform" style="display:none;"></div>
<div class='tocal' style='display:none; background-color:#ffffff;' />
</body>
</html>