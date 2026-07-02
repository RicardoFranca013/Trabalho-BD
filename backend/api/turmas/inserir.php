<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$dados = json_decode(file_get_contents('php://input'), true);

$camposObrigatorios = ['semestre', 'num_turma', 'ano', 'cod_disciplina', 'sala', 'vagas', 'matricula_professor'];

foreach ($camposObrigatorios as $campo) {
    if (!isset($dados[$campo]) || trim((string) $dados[$campo]) === '') {
        http_response_code(400);
        ob_clean();
        echo json_encode(['sucesso' => false, 'mensagem' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

$conexao = getConexao();

$sql = "INSERT INTO TURMA (semestre, num_turma, ano, cod_disciplina, sala, vagas, matricula_professor)
        VALUES (:semestre, :num_turma, :ano, :cod_disciplina, :sala, :vagas, :matricula_professor)";

$stmt = oci_parse($conexao, $sql);
oci_bind_by_name($stmt, ':semestre', $dados['semestre']);
oci_bind_by_name($stmt, ':num_turma', $dados['num_turma']);
oci_bind_by_name($stmt, ':ano', $dados['ano']);
oci_bind_by_name($stmt, ':cod_disciplina', $dados['cod_disciplina']);
oci_bind_by_name($stmt, ':sala', $dados['sala']);
oci_bind_by_name($stmt, ':vagas', $dados['vagas']);
oci_bind_by_name($stmt, ':matricula_professor', $dados['matricula_professor']);

if (oci_execute($stmt)) {
    ob_clean();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Turma cadastrada com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
