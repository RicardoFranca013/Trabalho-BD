<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$dados = json_decode(file_get_contents('php://input'), true);

$camposObrigatorios = ['cod_disciplina', 'nome', 'creditos'];

foreach ($camposObrigatorios as $campo) {
    if (!isset($dados[$campo]) || trim((string) $dados[$campo]) === '') {
        http_response_code(400);
        ob_clean();
        echo json_encode(['sucesso' => false, 'mensagem' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

$conexao = getConexao();

$sql = "INSERT INTO DISCIPLINA (cod_disciplina, nome, creditos) VALUES (:cod_disciplina, :nome, :creditos)";

$stmt = oci_parse($conexao, $sql);
oci_bind_by_name($stmt, ':cod_disciplina', $dados['cod_disciplina']);
oci_bind_by_name($stmt, ':nome', $dados['nome']);
oci_bind_by_name($stmt, ':creditos', $dados['creditos']);

if (oci_execute($stmt)) {
    ob_clean();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Disciplina cadastrada com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
