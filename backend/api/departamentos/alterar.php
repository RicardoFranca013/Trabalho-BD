<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$dados = json_decode(file_get_contents('php://input'), true);

$camposObrigatorios = ['cod_departamento', 'nome_departamento', 'telefone', 'sala', 'bloco', 'campus'];

foreach ($camposObrigatorios as $campo) {
    if (!isset($dados[$campo]) || trim((string) $dados[$campo]) === '') {
        http_response_code(400);
        ob_clean();
        echo json_encode(['sucesso' => false, 'mensagem' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

$conexao = getConexao();

$sql = "UPDATE DEPARTAMENTO
        SET nome_departamento = :nome_departamento, telefone = :telefone, sala = :sala, bloco = :bloco, campus = :campus
        WHERE cod_departamento = :cod_departamento";

$stmt = oci_parse($conexao, $sql);
oci_bind_by_name($stmt, ':cod_departamento', $dados['cod_departamento']);
oci_bind_by_name($stmt, ':nome_departamento', $dados['nome_departamento']);
oci_bind_by_name($stmt, ':telefone', $dados['telefone']);
oci_bind_by_name($stmt, ':sala', $dados['sala']);
oci_bind_by_name($stmt, ':bloco', $dados['bloco']);
oci_bind_by_name($stmt, ':campus', $dados['campus']);

if (oci_execute($stmt)) {
    ob_clean();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Departamento alterado com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
