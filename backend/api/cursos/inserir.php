<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$dados = json_decode(file_get_contents('php://input'), true);

$camposObrigatorios = ['cod_curso', 'nome', 'carga_horaria', 'cod_departamento', 'matricula_coordenador'];

foreach ($camposObrigatorios as $campo) {
    if (!isset($dados[$campo]) || trim((string) $dados[$campo]) === '') {
        http_response_code(400);
        ob_clean();
        echo json_encode(['sucesso' => false, 'mensagem' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

$conexao = getConexao();

$sql = "INSERT INTO CURSO (cod_curso, nome, carga_horaria, cod_departamento, matricula_coordenador)
        VALUES (:cod_curso, :nome, :carga_horaria, :cod_departamento, :matricula_coordenador)";

$stmt = oci_parse($conexao, $sql);
oci_bind_by_name($stmt, ':cod_curso', $dados['cod_curso']);
oci_bind_by_name($stmt, ':nome', $dados['nome']);
oci_bind_by_name($stmt, ':carga_horaria', $dados['carga_horaria']);
oci_bind_by_name($stmt, ':cod_departamento', $dados['cod_departamento']);
oci_bind_by_name($stmt, ':matricula_coordenador', $dados['matricula_coordenador']);

if (oci_execute($stmt)) {
    ob_clean();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Curso cadastrado com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
