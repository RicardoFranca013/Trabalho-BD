<?php

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Lê o .env manualmente, sem biblioteca
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    $linhas = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($linhas as $linha) {
        if (strpos(trim($linha), '#') === 0) continue;
        [$chave, $valor] = explode('=', $linha, 2);
        putenv(trim($chave) . '=' . trim($valor));
    }
}

$wallet_path = getenv('DB_WALLET_PATH');
$tns_name    = getenv('DB_TNS_NAME');
$usuario     = getenv('DB_USUARIO');
$senha       = getenv('DB_SENHA');

function getConexao() {
    global $wallet_path, $tns_name, $usuario, $senha;

    putenv("TNS_ADMIN=$wallet_path");
    $conexao = oci_connect($usuario, $senha, $tns_name);

    if (!$conexao) {
        $erro = oci_error();
        http_response_code(500);
        ob_clean();
        echo json_encode(['sucesso' => false, 'mensagem' => 'Falha ao conectar no Oracle: ' . ($erro['message'] ?? 'erro desconhecido')]);
        exit;
    }

    return $conexao;
}

function erroAmigavel($erro) {
    $mensagem = $erro['message'] ?? 'Erro desconhecido no banco de dados';

    if (preg_match('/ORA-20\d{3}:\s*(.+?)(\r|\n|$)/', $mensagem, $match)) {
        return trim($match[1]);
    }

    return $mensagem;
}

function responderErro($erro) {
    $mensagem = $erro['message'] ?? '';
    $ehErroDeNegocio = preg_match('/ORA-20\d{3}:/', $mensagem) === 1;

    http_response_code($ehErroDeNegocio ? 400 : 500);
    ob_clean();
    echo json_encode(['sucesso' => false, 'mensagem' => erroAmigavel($erro)]);
    exit;
}
