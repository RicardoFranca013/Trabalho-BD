<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT p.nome AS professor, t.cod_disciplina, t.semestre, t.ano
        FROM PROFESSOR p
        LEFT JOIN TURMA t ON p.matricula = t.matricula_professor
        ORDER BY p.nome";

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
