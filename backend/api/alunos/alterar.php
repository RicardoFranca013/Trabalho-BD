<?php
ob_start();
require_once __DIR__ . '/../../config/database.php';

$dados = json_decode(file_get_contents('php://input'), true);

$camposObrigatorios = ['matricula', 'categoria', 'nome', 'data_nascimento', 'nivel', 'sexo', 'cod_curso', 'status',
                        'logradouro', 'bairro', 'cep', 'numero', 'estado', 'cidade'];

foreach ($camposObrigatorios as $campo) {
    if (!isset($dados[$campo]) || trim((string) $dados[$campo]) === '') {
        http_response_code(400);
        ob_clean();
        echo json_encode(['sucesso' => false, 'mensagem' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

$conexao = getConexao();

$rendimento = ($dados['rendimento'] ?? '') === '' ? null : $dados['rendimento'];

$sql = "UPDATE ALUNO
        SET categoria = :categoria, nome = :nome, data_nascimento = TO_DATE(:data_nascimento, 'YYYY-MM-DD'),
            nivel = :nivel, sexo = :sexo, cod_curso = :cod_curso, status = :status, rendimento = :rendimento,
            logradouro = :logradouro, bairro = :bairro, cep = :cep, numero = :numero, estado = :estado, cidade = :cidade
        WHERE matricula = :matricula";

$stmt = oci_parse($conexao, $sql);
oci_bind_by_name($stmt, ':matricula', $dados['matricula']);
oci_bind_by_name($stmt, ':categoria', $dados['categoria']);
oci_bind_by_name($stmt, ':nome', $dados['nome']);
oci_bind_by_name($stmt, ':data_nascimento', $dados['data_nascimento']);
oci_bind_by_name($stmt, ':nivel', $dados['nivel']);
oci_bind_by_name($stmt, ':sexo', $dados['sexo']);
oci_bind_by_name($stmt, ':cod_curso', $dados['cod_curso']);
oci_bind_by_name($stmt, ':status', $dados['status']);
oci_bind_by_name($stmt, ':rendimento', $rendimento);
oci_bind_by_name($stmt, ':logradouro', $dados['logradouro']);
oci_bind_by_name($stmt, ':bairro', $dados['bairro']);
oci_bind_by_name($stmt, ':cep', $dados['cep']);
oci_bind_by_name($stmt, ':numero', $dados['numero']);
oci_bind_by_name($stmt, ':estado', $dados['estado']);
oci_bind_by_name($stmt, ':cidade', $dados['cidade']);

if (oci_execute($stmt)) {
    ob_clean();
    echo json_encode(['sucesso' => true, 'mensagem' => 'Aluno alterado com sucesso']);
    exit;
} else {
    responderErro(oci_error($stmt));
}
