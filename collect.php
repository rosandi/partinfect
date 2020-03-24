<html>
<title> simulation data collector</title>
<body>
<?php
$fname="./data/".date("Y-m-d-H-i-s").".dat";
$dfl=fopen($fname,"w");
$st=file_get_contents('php://input');
fwrite($dfl,$st);
fclose($dfl);    
echo "data accepted";
?>
</body>
</html>
