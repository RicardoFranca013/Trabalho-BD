<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$dados = json_decode(file_get_contents('php://input'), true);
$conexao = getConexao();

$sql = "DELETE FROM CURSO WHERE cod_curso = :cod_curso";

$stmt = oci_parse($conexao, $sql);
oci_bind_by_name($stmt, ':cod_curso', $dados['cod_curso']);

if (oci_execute($stmt)) {
    ob_clean();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Curso removido com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
