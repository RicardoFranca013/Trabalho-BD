<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT c.nome AS curso, COUNT(a.matricula) AS total_alunos
        FROM CURSO c
        JOIN ALUNO a ON a.cod_curso = c.cod_curso
        GROUP BY c.nome
        HAVING COUNT(a.matricula) > 5
        ORDER BY c.nome";

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
