<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT matricula, nome, titulo FROM PROFESSOR ORDER BY matricula";

$stmt = oci_parse($conexao, $sql);

if (!oci_execute($stmt)) {
    responderErro(oci_error($stmt));
}

$professores = [];
while ($linha = oci_fetch_assoc($stmt)) {
    $professores[] = array_change_key_case($linha, CASE_LOWER);
}

ob_clean();
echo json_encode($professores);
exit;
