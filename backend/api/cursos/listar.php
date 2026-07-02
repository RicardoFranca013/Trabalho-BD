<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$conexao = getConexao();

$sql = "SELECT cod_curso, nome, carga_horaria, cod_departamento, matricula_coordenador
        FROM CURSO
        ORDER BY cod_curso";

$stmt = oci_parse($conexao, $sql);

if (!oci_execute($stmt)) {
    responderErro(oci_error($stmt));
}

$cursos = [];
while ($linha = oci_fetch_assoc($stmt)) {
    $cursos[] = array_change_key_case($linha, CASE_LOWER);
}

ob_clean();
echo json_encode($cursos);
exit;
