<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT a.nome AS aluno, c.nome AS curso, d.nome_departamento AS departamento
        FROM ALUNO a
        INNER JOIN CURSO c ON a.cod_curso = c.cod_curso
        INNER JOIN DEPARTAMENTO d ON c.cod_departamento = d.cod_departamento
        ORDER BY a.nome";

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
