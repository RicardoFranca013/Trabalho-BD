<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT matricula_aluno, semestre, num_turma, ano, cod_disciplina, nota, frequencia
        FROM MATRICULA
        ORDER BY ano, semestre, num_turma";

$stmt = oci_parse($conexao, $sql);

if (!oci_execute($stmt)) {
    responderErro(oci_error($stmt));
}

$matriculas = [];
while ($linha = oci_fetch_assoc($stmt)) {
    $matriculas[] = array_change_key_case($linha, CASE_LOWER);
}

ob_clean();
echo json_encode($matriculas);
exit;
