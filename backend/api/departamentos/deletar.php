<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$dados = json_decode(file_get_contents('php://input'), true);
$conexao = getConexao();

$sql = "DELETE FROM DEPARTAMENTO WHERE cod_departamento = :cod_departamento";

$stmt = oci_parse($conexao, $sql);
oci_bind_by_name($stmt, ':cod_departamento', $dados['cod_departamento']);

if (oci_execute($stmt)) {
    ob_clean();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Departamento removido com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
