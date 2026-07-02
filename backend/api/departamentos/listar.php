<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT cod_departamento, nome_departamento, telefone, sala, bloco, campus
        FROM DEPARTAMENTO
        ORDER BY cod_departamento";

$stmt = oci_parse($conexao, $sql);

if (!oci_execute($stmt)) {
    responderErro(oci_error($stmt));
}

$departamentos = [];
while ($linha = oci_fetch_assoc($stmt)) {
    $departamentos[] = array_change_key_case($linha, CASE_LOWER);
}

ob_clean();
echo json_encode($departamentos);
exit;
