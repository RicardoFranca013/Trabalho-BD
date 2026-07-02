<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT nome, rendimento
        FROM ALUNO
        WHERE rendimento > (SELECT AVG(rendimento) FROM ALUNO)
        ORDER BY rendimento DESC";

$stmt = oci_parse($conexao, $sql);

if (!oci_execute($stmt)) {
    responderErro(oci_error($stmt));
}

$resultado = [];
while ($linha = oci_fetch_assoc($stmt)) {
    $resultado[] = array_change_key_case($linha, CASE_LOWER);
}

ob_clean();
echo json_encode($resultado);
exit;
