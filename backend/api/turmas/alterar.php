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

$sql = "UPDATE TURMA
        SET sala = :sala, vagas = :vagas, matricula_professor = :matricula_professor
        WHERE semestre = :semestre AND num_turma = :num_turma AND ano = :ano AND cod_disciplina = :cod_disciplina";

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
    echo json_encode(['sucesso' => true, 'mensagem' => 'Turma alterada com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
