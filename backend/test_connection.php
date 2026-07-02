<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/database.php';

putenv("TNS_ADMIN=$wallet_path");
$conexao = oci_connect($usuario, $senha, $tns_name);

if (!$conexao) {
    $erro = oci_error();
    echo json_encode(['conectado' => false, 'erro' => $erro['message'] ?? 'erro desconhecido']);
    exit;
}

$sql = "SELECT COUNT(*) AS total FROM ALUNO";
$stmt = oci_parse($conexao, $sql);

if (oci_execute($stmt)) {
    $linha = oci_fetch_assoc($stmt);
    echo json_encode(['conectado' => true, 'total_alunos' => (int) $linha['TOTAL']]);
} else {
    $erro = oci_error($stmt);
    echo json_encode(['conectado' => false, 'erro' => $erro['message'] ?? 'erro desconhecido']);
}
