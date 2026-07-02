<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT semestre, num_turma, ano, cod_disciplina, sala, vagas, matricula_professor
        FROM TURMA
        ORDER BY ano, semestre, num_turma";

$stmt = oci_parse($conexao, $sql);

if (!oci_execute($stmt)) {
    responderErro(oci_error($stmt));
}

$turmas = [];
while ($linha = oci_fetch_assoc($stmt)) {
    $turmas[] = array_change_key_case($linha, CASE_LOWER);
}

ob_clean();
echo json_encode($turmas);
exit;
