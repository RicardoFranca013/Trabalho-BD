<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT matricula, categoria, nome, TO_CHAR(data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
               nivel, sexo, cod_curso, status, rendimento,
               logradouro, bairro, cep, numero, estado, cidade
        FROM ALUNO
        ORDER BY matricula";

$stmt = oci_parse($conexao, $sql);

if (!oci_execute($stmt)) {
    responderErro(oci_error($stmt));
}

$alunos = [];
while ($linha = oci_fetch_assoc($stmt)) {
    $alunos[] = array_change_key_case($linha, CASE_LOWER);
}

ob_clean();
echo json_encode($alunos);
exit;
