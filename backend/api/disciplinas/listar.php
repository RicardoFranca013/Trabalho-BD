<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT cod_disciplina, nome, creditos FROM DISCIPLINA ORDER BY cod_disciplina";

$stmt = oci_parse($conexao, $sql);

if (!oci_execute($stmt)) {
    responderErro(oci_error($stmt));
}

$disciplinas = [];
while ($linha = oci_fetch_assoc($stmt)) {
    $disciplinas[] = array_change_key_case($linha, CASE_LOWER);
}

ob_clean();
echo json_encode($disciplinas);
exit;
