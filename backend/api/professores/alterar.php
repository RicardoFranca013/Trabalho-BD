<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$dados = json_decode(file_get_contents('php://input'), true);

$camposObrigatorios = ['matricula', 'nome', 'titulo'];

foreach ($camposObrigatorios as $campo) {
    if (!isset($dados[$campo]) || trim((string) $dados[$campo]) === '') {
        http_response_code(400);
        ob_clean();
        echo json_encode(['sucesso' => false, 'mensagem' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

$conexao = getConexao();

$sql = "UPDATE PROFESSOR SET nome = :nome, titulo = :titulo WHERE matricula = :matricula";

$stmt = oci_parse($conexao, $sql);
oci_bind_by_name($stmt, ':matricula', $dados['matricula']);
oci_bind_by_name($stmt, ':nome', $dados['nome']);
oci_bind_by_name($stmt, ':titulo', $dados['titulo']);

if (oci_execute($stmt)) {
    ob_clean();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Professor alterado com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
