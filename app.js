// ==========================================
// 1. NAVEGAÇÃO DO SPA (Single Page Application)
// ==========================================
document.querySelectorAll('#nav-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active de todos os links e adiciona no clicado
        document.querySelectorAll('#nav-menu a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        // Esconde todas as seções
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
        
        // Mostra a seção alvo
        const targetId = this.getAttribute('data-target');
        document.getElementById(targetId).classList.remove('hidden');
    });
});

// ==========================================
// 2. CRUD DE ALUNOS (Integração com PHP)
// ==========================================

const API_URL = 'http://localhost/seu_projeto_php/api'; // Ajuste para o caminho real do seu XAMPP/Servidor

// CREATE e UPDATE
document.getElementById('form-aluno').addEventListener('submit', async (e) => {
    e.preventDefault();

    const acao = document.getElementById('aluno-acao').value; // 'insert' ou 'update'
    const matricula = document.getElementById('matricula').value;
    
    const payload = {
        matricula: matricula,
        nome: document.getElementById('nome').value,
        nivel: document.getElementById('nivel').value,
        id_curso: document.getElementById('id_curso').value
    };

    const endpoint = acao === 'insert' ? `${API_URL}/alunos_inserir.php` : `${API_URL}/alunos_alterar.php`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if(result.sucesso) {
            alert('Registro salvo com sucesso!');
            limparFormulario();
            listarAlunos(); // Atualiza a tabela
        } else {
            alert('Erro: ' + result.mensagem);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Simulação: Formulário enviado. (Conecte o backend PHP para persistir).');
        limparFormulario();
    }
});

// READ (Listar)
async function listarAlunos() {
    try {
        const response = await fetch(`${API_URL}/alunos_listar.php`);
        const alunos = await response.json();
        renderizarTabelaAlunos(alunos);
    } catch (error) {
        console.log('Backend não encontrado. Injetando dados mockados para teste de UI.');
        // Dados fictícios para você testar a interface enquanto programa o PHP
        renderizarTabelaAlunos([
            { matricula: 2026101, nome: "Ana Costa", nivel: "Graduação" },
            { matricula: 2026102, nome: "Marcos Silva", nivel: "Mestrado" }
        ]);
    }
}

function renderizarTabelaAlunos(dados) {
    const tbody = document.querySelector('#tabela-alunos tbody');
    tbody.innerHTML = '';

    dados.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aluno.matricula}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.nivel}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicao(${aluno.matricula}, '${aluno.nome}', '${aluno.nivel}')">Editar</button>
                <button class="btn-danger" onclick="deletarAluno(${aluno.matricula})">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// DELETE
async function deletarAluno(matricula) {
    if(confirm('Tem certeza que deseja remover este aluno?')) {
        try {
            const response = await fetch(`${API_URL}/alunos_deletar.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula: matricula })
            });
            alert('Aluno removido!');
            listarAlunos();
        } catch (error) {
            alert(`Simulação: Requisição de DELETE enviada para a matrícula ${matricula}.`);
        }
    }
}

// Auxiliares de UI
function prepararEdicao(matricula, nome, nivel) {
    document.getElementById('form-title').innerText = 'Alterar Aluno';
    document.getElementById('aluno-acao').value = 'update';
    document.getElementById('matricula').value = matricula;
    document.getElementById('matricula').readOnly = true; // Impede alterar a PK
    document.getElementById('nome').value = nome;
    document.getElementById('nivel').value = nivel;
    
    document.getElementById('btn-cancelar').classList.remove('hidden');
}

function limparFormulario() {
    document.getElementById('form-aluno').reset();
    document.getElementById('form-title').innerText = 'Cadastrar Novo Aluno';
    document.getElementById('aluno-acao').value = 'insert';
    document.getElementById('matricula').readOnly = false;
    document.getElementById('btn-cancelar').classList.add('hidden');
}

document.getElementById('btn-cancelar').addEventListener('click', limparFormulario);

// ==========================================
// 3. RELATÓRIOS DO TP (Integração)
// ==========================================
async function carregarRelatorio(tipo) {
    // No seu PHP, você pode ter um arquivo relatorios.php que recebe ?tipo=inner-join
    try {
        const response = await fetch(`${API_URL}/relatorios.php?tipo=${tipo}`);
        const dados = await response.json();
        // Lógica para montar a tabela dependendo do retorno...
        alert(`Buscando relatório: ${tipo}`);
    } catch (error) {
        // Exemplo visual para o vídeo caso o back-end não retorne ainda
        document.getElementById('relatorio-header').innerHTML = '<th>Aviso</th>';
        document.getElementById('relatorio-body').innerHTML = `<tr><td>Requisição para <b>${tipo}</b> enviada ao PHP. Construa a query no backend e retorne o JSON.</td></tr>`;
    }
}

// Inicializa a listagem ao abrir a página
window.onload = listarAlunos;