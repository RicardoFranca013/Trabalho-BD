<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$dados = json_decode(file_get_contents('php://input'), true);
$conexao = getConexao();

$sql = "DELETE FROM MATRICULA
        WHERE matricula_aluno = :matricula_aluno AND semestre = :semestre AND num_turma = :num_turma
              AND ano = :ano AND cod_disciplina = :cod_disciplina";

$stmt = oci_parse($conexao, $sql);
oci_bind_by_name($stmt, ':matricula_aluno', $dados['matricula_aluno']);
oci_bind_by_name($stmt, ':semestre', $dados['semestre']);
oci_bind_by_name($stmt, ':num_turma', $dados['num_turma']);
oci_bind_by_name($stmt, ':ano', $dados['ano']);
oci_bind_by_name($stmt, ':cod_disciplina', $dados['cod_disciplina']);

if (oci_execute($stmt)) {
    ob_clean();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Matrícula removida com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
