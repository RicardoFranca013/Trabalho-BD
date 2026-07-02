// ==========================================
// 1. NAVEGAÇÃO DO SPA (Single Page Application)
// ==========================================
document.querySelectorAll('#nav-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        document.querySelectorAll('#nav-menu a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));

        const targetId = this.getAttribute('data-target');
        document.getElementById(targetId).classList.remove('hidden');
    });
});

const API_URL = 'http://localhost:8000/backend/api';

// ==========================================
// 2. FUNÇÕES AUXILIARES
// ==========================================

function formatarData(valor) {
    if (!valor) return '—';
    const [ano, mes, dia] = valor.split('-');
    if (!ano || !mes || !dia) return valor;
    return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor) {
    if (valor === null || valor === undefined || valor === '') return '—';
    return valor;
}

function formatarDecimal(valor) {
    if (valor === null || valor === undefined || valor === '') return '—';
    return Number(valor).toFixed(2);
}

function preencherSelect(selectId, dados, campoValor, campoLabel) {
    const select = document.getElementById(selectId);
    const valorAtual = select.value;
    select.innerHTML = '<option value="">Selecione</option>';

    dados.forEach(item => {
        const option = document.createElement('option');
        option.value = item[campoValor];
        option.textContent = `${item[campoValor]} - ${item[campoLabel]}`;
        select.appendChild(option);
    });

    if (valorAtual) select.value = valorAtual;
}

async function executarComCarregamento(botao, textoCarregando, tarefa) {
    const textoOriginal = botao.innerText;
    botao.disabled = true;
    botao.innerText = textoCarregando;
    try {
        await tarefa();
    } finally {
        botao.disabled = false;
        botao.innerText = textoOriginal;
    }
}

function mostrarToast(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerText = mensagem;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-saindo');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function linhaEstadoVazio(colunas, mensagem = 'Nenhum registro cadastrado ainda.') {
    return `<tr class="linha-vazia"><td colspan="${colunas}">📭 ${mensagem}</td></tr>`;
}

// ==========================================
// 3. CRUD DE ALUNOS
// ==========================================

let alunosCache = [];

document.getElementById('form-aluno').addEventListener('submit', async (e) => {
    e.preventDefault();

    const acao = document.getElementById('aluno-acao').value;
    const botao = e.target.querySelector('button[type="submit"]');

    const payload = {
        matricula: document.getElementById('matricula').value.trim(),
        categoria: document.getElementById('aluno-categoria').value.trim(),
        nome: document.getElementById('nome').value.trim(),
        data_nascimento: document.getElementById('aluno-data-nascimento').value.trim(),
        nivel: document.getElementById('nivel').value,
        sexo: document.getElementById('aluno-sexo').value,
        cod_curso: document.getElementById('aluno-cod-curso').value,
        status: document.getElementById('aluno-status').value,
        rendimento: document.getElementById('aluno-rendimento').value.trim(),
        logradouro: document.getElementById('aluno-logradouro').value.trim(),
        numero: document.getElementById('aluno-numero').value.trim(),
        bairro: document.getElementById('aluno-bairro').value.trim(),
        cep: document.getElementById('aluno-cep').value.trim(),
        cidade: document.getElementById('aluno-cidade').value.trim(),
        estado: document.getElementById('aluno-estado').value.trim()
    };

    const obrigatorios = ['matricula', 'categoria', 'nome', 'data_nascimento', 'nivel', 'sexo', 'cod_curso', 'status',
                           'logradouro', 'numero', 'bairro', 'cep', 'cidade', 'estado'];
    if (obrigatorios.some(campo => payload[campo] === '')) {
        mostrarToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    await executarComCarregamento(botao, 'Salvando...', async () => {
        if (acao === 'insert') {
            await inserirAluno(payload);
        } else {
            await alterarAluno(payload);
        }
    });
});

async function inserirAluno(payload) {
    try {
        const response = await fetch(`${API_URL}/alunos/inserir.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Aluno cadastrado com sucesso!', 'sucesso');
            limparFormularioAluno();
            listarAlunos();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function alterarAluno(payload) {
    try {
        const response = await fetch(`${API_URL}/alunos/alterar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Aluno alterado com sucesso!', 'sucesso');
            limparFormularioAluno();
            listarAlunos();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function deletarAluno(matricula) {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;

    try {
        const response = await fetch(`${API_URL}/alunos/deletar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula })
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Aluno removido com sucesso!', 'sucesso');
            listarAlunos();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function listarAlunos() {
    try {
        const response = await fetch(`${API_URL}/alunos/listar.php`);
        alunosCache = await response.json();
        renderizarTabelaAlunos(alunosCache);
        preencherSelect('matricula-aluno', alunosCache, 'matricula', 'nome');
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        mostrarToast('Erro de conexão ao carregar alunos.', 'erro');
    }
}

function renderizarTabelaAlunos(dados) {
    const tbody = document.querySelector('#tabela-alunos tbody');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = linhaEstadoVazio(9);
        return;
    }

    dados.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aluno.matricula}</td>
            <td>${aluno.nome}</td>
            <td>${formatarData(aluno.data_nascimento)}</td>
            <td>${formatarValor(aluno.nivel)}</td>
            <td>${formatarValor(aluno.sexo)}</td>
            <td>${formatarValor(aluno.cod_curso)}</td>
            <td>${formatarValor(aluno.status)}</td>
            <td>${formatarDecimal(aluno.rendimento)}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicaoAluno(${aluno.matricula})">Editar</button>
                <button class="btn-danger" onclick="deletarAluno(${aluno.matricula})">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function prepararEdicaoAluno(matricula) {
    const aluno = alunosCache.find(a => a.matricula == matricula);
    if (!aluno) return;

    document.getElementById('form-title').innerText = 'Editar Aluno';
    document.getElementById('aluno-acao').value = 'update';
    document.getElementById('matricula').value = aluno.matricula;
    document.getElementById('matricula').readOnly = true;
    document.getElementById('aluno-categoria').value = aluno.categoria;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('aluno-data-nascimento').value = aluno.data_nascimento;
    document.getElementById('nivel').value = aluno.nivel;
    document.getElementById('aluno-sexo').value = aluno.sexo;
    document.getElementById('aluno-cod-curso').value = aluno.cod_curso;
    document.getElementById('aluno-status').value = aluno.status;
    document.getElementById('aluno-rendimento').value = aluno.rendimento;
    document.getElementById('aluno-logradouro').value = aluno.logradouro;
    document.getElementById('aluno-numero').value = aluno.numero;
    document.getElementById('aluno-bairro').value = aluno.bairro;
    document.getElementById('aluno-cep').value = aluno.cep;
    document.getElementById('aluno-cidade').value = aluno.cidade;
    document.getElementById('aluno-estado').value = aluno.estado;

    document.getElementById('btn-cancelar').classList.remove('hidden');
    document.getElementById('form-aluno').scrollIntoView({ behavior: 'smooth' });
}

function limparFormularioAluno() {
    document.getElementById('form-aluno').reset();
    document.getElementById('form-title').innerText = 'Cadastrar Novo Aluno';
    document.getElementById('aluno-acao').value = 'insert';
    document.getElementById('matricula').readOnly = false;
    document.getElementById('btn-cancelar').classList.add('hidden');
}

document.getElementById('btn-cancelar').addEventListener('click', limparFormularioAluno);

// ==========================================
// 4. CRUD DE PROFESSORES
// ==========================================

let professoresCache = [];

document.getElementById('form-professor').addEventListener('submit', async (e) => {
    e.preventDefault();

    const acao = document.getElementById('professor-acao').value;
    const botao = e.target.querySelector('button[type="submit"]');

    const payload = {
        matricula: document.getElementById('professor-matricula').value.trim(),
        nome: document.getElementById('professor-nome').value.trim(),
        titulo: document.getElementById('professor-titulo').value.trim()
    };

    const obrigatorios = ['matricula', 'nome', 'titulo'];
    if (obrigatorios.some(campo => payload[campo] === '')) {
        mostrarToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    await executarComCarregamento(botao, 'Salvando...', async () => {
        if (acao === 'insert') {
            await inserirProfessor(payload);
        } else {
            await alterarProfessor(payload);
        }
    });
});

async function inserirProfessor(payload) {
    try {
        const response = await fetch(`${API_URL}/professores/inserir.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Professor cadastrado com sucesso!', 'sucesso');
            limparFormularioProfessor();
            listarProfessores();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function alterarProfessor(payload) {
    try {
        const response = await fetch(`${API_URL}/professores/alterar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Professor alterado com sucesso!', 'sucesso');
            limparFormularioProfessor();
            listarProfessores();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function deletarProfessor(matricula) {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;

    try {
        const response = await fetch(`${API_URL}/professores/deletar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula })
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Professor removido com sucesso!', 'sucesso');
            listarProfessores();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function listarProfessores() {
    try {
        const response = await fetch(`${API_URL}/professores/listar.php`);
        professoresCache = await response.json();
        renderizarTabelaProfessores(professoresCache);
        preencherSelect('curso-coordenador', professoresCache, 'matricula', 'nome');
        preencherSelect('turma-professor', professoresCache, 'matricula', 'nome');
    } catch (error) {
        console.error('Erro ao carregar professores:', error);
        mostrarToast('Erro de conexão ao carregar professores.', 'erro');
    }
}

function renderizarTabelaProfessores(dados) {
    const tbody = document.querySelector('#tabela-professores tbody');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = linhaEstadoVazio(4);
        return;
    }

    dados.forEach(professor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${professor.matricula}</td>
            <td>${professor.nome}</td>
            <td>${professor.titulo}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicaoProfessor(${professor.matricula})">Editar</button>
                <button class="btn-danger" onclick="deletarProfessor(${professor.matricula})">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function prepararEdicaoProfessor(matricula) {
    const professor = professoresCache.find(p => p.matricula == matricula);
    if (!professor) return;

    document.getElementById('form-title-professor').innerText = 'Editar Professor';
    document.getElementById('professor-acao').value = 'update';
    document.getElementById('professor-matricula').value = professor.matricula;
    document.getElementById('professor-matricula').readOnly = true;
    document.getElementById('professor-nome').value = professor.nome;
    document.getElementById('professor-titulo').value = professor.titulo;

    document.getElementById('btn-cancelar-professor').classList.remove('hidden');
    document.getElementById('form-professor').scrollIntoView({ behavior: 'smooth' });
}

function limparFormularioProfessor() {
    document.getElementById('form-professor').reset();
    document.getElementById('form-title-professor').innerText = 'Cadastrar Novo Professor';
    document.getElementById('professor-acao').value = 'insert';
    document.getElementById('professor-matricula').readOnly = false;
    document.getElementById('btn-cancelar-professor').classList.add('hidden');
}

document.getElementById('btn-cancelar-professor').addEventListener('click', limparFormularioProfessor);

// ==========================================
// 5. CRUD DE CURSOS
// ==========================================

let cursosCache = [];

document.getElementById('form-curso').addEventListener('submit', async (e) => {
    e.preventDefault();

    const acao = document.getElementById('curso-acao').value;
    const botao = e.target.querySelector('button[type="submit"]');

    const payload = {
        cod_curso: document.getElementById('curso-cod').value.trim(),
        nome: document.getElementById('curso-nome').value.trim(),
        carga_horaria: document.getElementById('curso-carga').value.trim(),
        cod_departamento: document.getElementById('curso-departamento').value,
        matricula_coordenador: document.getElementById('curso-coordenador').value
    };

    const obrigatorios = ['cod_curso', 'nome', 'carga_horaria', 'cod_departamento', 'matricula_coordenador'];
    if (obrigatorios.some(campo => payload[campo] === '')) {
        mostrarToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    await executarComCarregamento(botao, 'Salvando...', async () => {
        if (acao === 'insert') {
            await inserirCurso(payload);
        } else {
            await alterarCurso(payload);
        }
    });
});

async function inserirCurso(payload) {
    try {
        const response = await fetch(`${API_URL}/cursos/inserir.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Curso cadastrado com sucesso!', 'sucesso');
            limparFormularioCurso();
            listarCursos();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function alterarCurso(payload) {
    try {
        const response = await fetch(`${API_URL}/cursos/alterar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Curso alterado com sucesso!', 'sucesso');
            limparFormularioCurso();
            listarCursos();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function deletarCurso(cod_curso) {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;

    try {
        const response = await fetch(`${API_URL}/cursos/deletar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cod_curso })
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Curso removido com sucesso!', 'sucesso');
            listarCursos();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function listarCursos() {
    try {
        const response = await fetch(`${API_URL}/cursos/listar.php`);
        cursosCache = await response.json();
        renderizarTabelaCursos(cursosCache);
        preencherSelect('aluno-cod-curso', cursosCache, 'cod_curso', 'nome');
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        mostrarToast('Erro de conexão ao carregar cursos.', 'erro');
    }
}

function renderizarTabelaCursos(dados) {
    const tbody = document.querySelector('#tabela-cursos tbody');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = linhaEstadoVazio(6);
        return;
    }

    dados.forEach(curso => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${curso.cod_curso}</td>
            <td>${curso.nome}</td>
            <td>${curso.carga_horaria}</td>
            <td>${formatarValor(curso.cod_departamento)}</td>
            <td>${formatarValor(curso.matricula_coordenador)}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicaoCurso('${curso.cod_curso}')">Editar</button>
                <button class="btn-danger" onclick="deletarCurso('${curso.cod_curso}')">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function prepararEdicaoCurso(cod_curso) {
    const curso = cursosCache.find(c => c.cod_curso == cod_curso);
    if (!curso) return;

    document.getElementById('form-title-curso').innerText = 'Editar Curso';
    document.getElementById('curso-acao').value = 'update';
    document.getElementById('curso-cod').value = curso.cod_curso;
    document.getElementById('curso-cod').readOnly = true;
    document.getElementById('curso-nome').value = curso.nome;
    document.getElementById('curso-carga').value = curso.carga_horaria;
    document.getElementById('curso-departamento').value = curso.cod_departamento;
    document.getElementById('curso-coordenador').value = curso.matricula_coordenador;

    document.getElementById('btn-cancelar-curso').classList.remove('hidden');
    document.getElementById('form-curso').scrollIntoView({ behavior: 'smooth' });
}

function limparFormularioCurso() {
    document.getElementById('form-curso').reset();
    document.getElementById('form-title-curso').innerText = 'Cadastrar Novo Curso';
    document.getElementById('curso-acao').value = 'insert';
    document.getElementById('curso-cod').readOnly = false;
    document.getElementById('btn-cancelar-curso').classList.add('hidden');
}

document.getElementById('btn-cancelar-curso').addEventListener('click', limparFormularioCurso);

// ==========================================
// 6. CRUD DE DEPARTAMENTOS
// ==========================================

let departamentosCache = [];

document.getElementById('form-departamento').addEventListener('submit', async (e) => {
    e.preventDefault();

    const acao = document.getElementById('departamento-acao').value;
    const botao = e.target.querySelector('button[type="submit"]');

    const payload = {
        cod_departamento: document.getElementById('departamento-cod').value.trim(),
        nome_departamento: document.getElementById('departamento-nome').value.trim(),
        telefone: document.getElementById('departamento-telefone').value.trim(),
        sala: document.getElementById('departamento-sala').value.trim(),
        bloco: document.getElementById('departamento-bloco').value.trim(),
        campus: document.getElementById('departamento-campus').value.trim()
    };

    const obrigatorios = ['cod_departamento', 'nome_departamento', 'telefone', 'sala', 'bloco', 'campus'];
    if (obrigatorios.some(campo => payload[campo] === '')) {
        mostrarToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    await executarComCarregamento(botao, 'Salvando...', async () => {
        if (acao === 'insert') {
            await inserirDepartamento(payload);
        } else {
            await alterarDepartamento(payload);
        }
    });
});

async function inserirDepartamento(payload) {
    try {
        const response = await fetch(`${API_URL}/departamentos/inserir.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Departamento cadastrado com sucesso!', 'sucesso');
            limparFormularioDepartamento();
            listarDepartamentos();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function alterarDepartamento(payload) {
    try {
        const response = await fetch(`${API_URL}/departamentos/alterar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Departamento alterado com sucesso!', 'sucesso');
            limparFormularioDepartamento();
            listarDepartamentos();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function deletarDepartamento(cod_departamento) {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;

    try {
        const response = await fetch(`${API_URL}/departamentos/deletar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cod_departamento })
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Departamento removido com sucesso!', 'sucesso');
            listarDepartamentos();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function listarDepartamentos() {
    try {
        const response = await fetch(`${API_URL}/departamentos/listar.php`);
        departamentosCache = await response.json();
        renderizarTabelaDepartamentos(departamentosCache);
        preencherSelect('curso-departamento', departamentosCache, 'cod_departamento', 'nome_departamento');
    } catch (error) {
        console.error('Erro ao carregar departamentos:', error);
        mostrarToast('Erro de conexão ao carregar departamentos.', 'erro');
    }
}

function renderizarTabelaDepartamentos(dados) {
    const tbody = document.querySelector('#tabela-departamentos tbody');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = linhaEstadoVazio(7);
        return;
    }

    dados.forEach(departamento => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${departamento.cod_departamento}</td>
            <td>${departamento.nome_departamento}</td>
            <td>${departamento.telefone}</td>
            <td>${formatarValor(departamento.sala)}</td>
            <td>${formatarValor(departamento.bloco)}</td>
            <td>${formatarValor(departamento.campus)}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicaoDepartamento('${departamento.cod_departamento}')">Editar</button>
                <button class="btn-danger" onclick="deletarDepartamento('${departamento.cod_departamento}')">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function prepararEdicaoDepartamento(cod_departamento) {
    const departamento = departamentosCache.find(d => d.cod_departamento == cod_departamento);
    if (!departamento) return;

    document.getElementById('form-title-departamento').innerText = 'Editar Departamento';
    document.getElementById('departamento-acao').value = 'update';
    document.getElementById('departamento-cod').value = departamento.cod_departamento;
    document.getElementById('departamento-cod').readOnly = true;
    document.getElementById('departamento-nome').value = departamento.nome_departamento;
    document.getElementById('departamento-telefone').value = departamento.telefone;
    document.getElementById('departamento-sala').value = departamento.sala;
    document.getElementById('departamento-bloco').value = departamento.bloco;
    document.getElementById('departamento-campus').value = departamento.campus;

    document.getElementById('btn-cancelar-departamento').classList.remove('hidden');
    document.getElementById('form-departamento').scrollIntoView({ behavior: 'smooth' });
}

function limparFormularioDepartamento() {
    document.getElementById('form-departamento').reset();
    document.getElementById('form-title-departamento').innerText = 'Cadastrar Novo Departamento';
    document.getElementById('departamento-acao').value = 'insert';
    document.getElementById('departamento-cod').readOnly = false;
    document.getElementById('btn-cancelar-departamento').classList.add('hidden');
}

document.getElementById('btn-cancelar-departamento').addEventListener('click', limparFormularioDepartamento);

// ==========================================
// 7. CRUD DE DISCIPLINAS
// ==========================================

let disciplinasCache = [];

document.getElementById('form-disciplina').addEventListener('submit', async (e) => {
    e.preventDefault();

    const acao = document.getElementById('disciplina-acao').value;
    const botao = e.target.querySelector('button[type="submit"]');

    const payload = {
        cod_disciplina: document.getElementById('disciplina-cod').value.trim(),
        nome: document.getElementById('disciplina-nome').value.trim(),
        creditos: document.getElementById('disciplina-creditos').value.trim()
    };

    const obrigatorios = ['cod_disciplina', 'nome', 'creditos'];
    if (obrigatorios.some(campo => payload[campo] === '')) {
        mostrarToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    await executarComCarregamento(botao, 'Salvando...', async () => {
        if (acao === 'insert') {
            await inserirDisciplina(payload);
        } else {
            await alterarDisciplina(payload);
        }
    });
});

async function inserirDisciplina(payload) {
    try {
        const response = await fetch(`${API_URL}/disciplinas/inserir.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Disciplina cadastrada com sucesso!', 'sucesso');
            limparFormularioDisciplina();
            listarDisciplinas();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function alterarDisciplina(payload) {
    try {
        const response = await fetch(`${API_URL}/disciplinas/alterar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Disciplina alterada com sucesso!', 'sucesso');
            limparFormularioDisciplina();
            listarDisciplinas();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function deletarDisciplina(cod_disciplina) {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;

    try {
        const response = await fetch(`${API_URL}/disciplinas/deletar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cod_disciplina })
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Disciplina removida com sucesso!', 'sucesso');
            listarDisciplinas();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function listarDisciplinas() {
    try {
        const response = await fetch(`${API_URL}/disciplinas/listar.php`);
        disciplinasCache = await response.json();
        renderizarTabelaDisciplinas(disciplinasCache);
        preencherSelect('turma-disciplina', disciplinasCache, 'cod_disciplina', 'nome');
    } catch (error) {
        console.error('Erro ao carregar disciplinas:', error);
        mostrarToast('Erro de conexão ao carregar disciplinas.', 'erro');
    }
}

function renderizarTabelaDisciplinas(dados) {
    const tbody = document.querySelector('#tabela-disciplinas tbody');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = linhaEstadoVazio(4);
        return;
    }

    dados.forEach(disciplina => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${disciplina.cod_disciplina}</td>
            <td>${disciplina.nome}</td>
            <td>${disciplina.creditos}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicaoDisciplina('${disciplina.cod_disciplina}')">Editar</button>
                <button class="btn-danger" onclick="deletarDisciplina('${disciplina.cod_disciplina}')">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function prepararEdicaoDisciplina(cod_disciplina) {
    const disciplina = disciplinasCache.find(d => d.cod_disciplina == cod_disciplina);
    if (!disciplina) return;

    document.getElementById('form-title-disciplina').innerText = 'Editar Disciplina';
    document.getElementById('disciplina-acao').value = 'update';
    document.getElementById('disciplina-cod').value = disciplina.cod_disciplina;
    document.getElementById('disciplina-cod').readOnly = true;
    document.getElementById('disciplina-nome').value = disciplina.nome;
    document.getElementById('disciplina-creditos').value = disciplina.creditos;

    document.getElementById('btn-cancelar-disciplina').classList.remove('hidden');
    document.getElementById('form-disciplina').scrollIntoView({ behavior: 'smooth' });
}

function limparFormularioDisciplina() {
    document.getElementById('form-disciplina').reset();
    document.getElementById('form-title-disciplina').innerText = 'Cadastrar Nova Disciplina';
    document.getElementById('disciplina-acao').value = 'insert';
    document.getElementById('disciplina-cod').readOnly = false;
    document.getElementById('btn-cancelar-disciplina').classList.add('hidden');
}

document.getElementById('btn-cancelar-disciplina').addEventListener('click', limparFormularioDisciplina);

// ==========================================
// 8. CRUD DE TURMAS
// ==========================================

let turmasCache = [];

document.getElementById('form-turma').addEventListener('submit', async (e) => {
    e.preventDefault();

    const acao = document.getElementById('turma-acao').value;
    const botao = e.target.querySelector('button[type="submit"]');

    const payload = {
        semestre: document.getElementById('turma-semestre').value,
        num_turma: document.getElementById('turma-num').value.trim(),
        ano: document.getElementById('turma-ano').value.trim(),
        cod_disciplina: document.getElementById('turma-disciplina').value,
        sala: document.getElementById('turma-sala').value.trim(),
        vagas: document.getElementById('turma-vagas').value.trim(),
        matricula_professor: document.getElementById('turma-professor').value
    };

    const obrigatorios = ['semestre', 'num_turma', 'ano', 'cod_disciplina', 'sala', 'vagas', 'matricula_professor'];
    if (obrigatorios.some(campo => payload[campo] === '')) {
        mostrarToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    await executarComCarregamento(botao, 'Salvando...', async () => {
        if (acao === 'insert') {
            await inserirTurma(payload);
        } else {
            await alterarTurma(payload);
        }
    });
});

async function inserirTurma(payload) {
    try {
        const response = await fetch(`${API_URL}/turmas/inserir.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Turma cadastrada com sucesso!', 'sucesso');
            limparFormularioTurma();
            listarTurmas();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function alterarTurma(payload) {
    try {
        const response = await fetch(`${API_URL}/turmas/alterar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Turma alterada com sucesso!', 'sucesso');
            limparFormularioTurma();
            listarTurmas();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function deletarTurma(semestre, num_turma, ano, cod_disciplina) {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;

    try {
        const response = await fetch(`${API_URL}/turmas/deletar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ semestre, num_turma, ano, cod_disciplina })
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Turma removida com sucesso!', 'sucesso');
            listarTurmas();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function listarTurmas() {
    try {
        const response = await fetch(`${API_URL}/turmas/listar.php`);
        turmasCache = await response.json();
        renderizarTabelaTurmas(turmasCache);
        popularSelectTurmasParaMatricula();
    } catch (error) {
        console.error('Erro ao carregar turmas:', error);
        mostrarToast('Erro de conexão ao carregar turmas.', 'erro');
    }
}

function renderizarTabelaTurmas(dados) {
    const tbody = document.querySelector('#tabela-turmas tbody');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = linhaEstadoVazio(8);
        return;
    }

    dados.forEach(turma => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${turma.semestre}</td>
            <td>${turma.num_turma}</td>
            <td>${turma.ano}</td>
            <td>${turma.cod_disciplina}</td>
            <td>${formatarValor(turma.sala)}</td>
            <td>${formatarValor(turma.vagas)}</td>
            <td>${formatarValor(turma.matricula_professor)}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicaoTurma(${turma.semestre}, ${turma.num_turma}, ${turma.ano}, '${turma.cod_disciplina}')">Editar</button>
                <button class="btn-danger" onclick="deletarTurma(${turma.semestre}, ${turma.num_turma}, ${turma.ano}, '${turma.cod_disciplina}')">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function prepararEdicaoTurma(semestre, num_turma, ano, cod_disciplina) {
    const turma = turmasCache.find(t =>
        t.semestre == semestre && t.num_turma == num_turma && t.ano == ano && t.cod_disciplina == cod_disciplina
    );
    if (!turma) return;

    document.getElementById('form-title-turma').innerText = 'Editar Turma';
    document.getElementById('turma-acao').value = 'update';
    document.getElementById('turma-semestre').value = turma.semestre;
    document.getElementById('turma-num').value = turma.num_turma;
    document.getElementById('turma-ano').value = turma.ano;
    document.getElementById('turma-disciplina').value = turma.cod_disciplina;
    document.getElementById('turma-semestre').disabled = true;
    document.getElementById('turma-num').readOnly = true;
    document.getElementById('turma-ano').readOnly = true;
    document.getElementById('turma-disciplina').disabled = true;
    document.getElementById('turma-sala').value = turma.sala;
    document.getElementById('turma-vagas').value = turma.vagas;
    document.getElementById('turma-professor').value = turma.matricula_professor;

    document.getElementById('btn-cancelar-turma').classList.remove('hidden');
    document.getElementById('form-turma').scrollIntoView({ behavior: 'smooth' });
}

function limparFormularioTurma() {
    document.getElementById('form-turma').reset();
    document.getElementById('form-title-turma').innerText = 'Cadastrar Nova Turma';
    document.getElementById('turma-acao').value = 'insert';
    document.getElementById('turma-semestre').disabled = false;
    document.getElementById('turma-num').readOnly = false;
    document.getElementById('turma-ano').readOnly = false;
    document.getElementById('turma-disciplina').disabled = false;
    document.getElementById('btn-cancelar-turma').classList.add('hidden');
}

document.getElementById('btn-cancelar-turma').addEventListener('click', limparFormularioTurma);

// ==========================================
// 9. CRUD DE MATRÍCULAS
// ==========================================

let matriculasCache = [];

function popularSelectTurmasParaMatricula() {
    const select = document.getElementById('matricula-turma-select');
    const valorAtual = select.value;
    select.innerHTML = '<option value="">Selecione</option>';

    turmasCache.forEach(turma => {
        const option = document.createElement('option');
        option.value = `${turma.semestre}_${turma.num_turma}_${turma.ano}_${turma.cod_disciplina}`;
        option.textContent = `${turma.ano}/${turma.semestre} - Turma ${turma.num_turma} - ${turma.cod_disciplina}`;
        option.dataset.semestre = turma.semestre;
        option.dataset.numTurma = turma.num_turma;
        option.dataset.ano = turma.ano;
        option.dataset.codDisciplina = turma.cod_disciplina;
        select.appendChild(option);
    });

    if (valorAtual) select.value = valorAtual;
}

document.getElementById('form-matricula').addEventListener('submit', async (e) => {
    e.preventDefault();

    const acao = document.getElementById('matricula-acao').value;
    const botao = e.target.querySelector('button[type="submit"]');
    const turmaOption = document.getElementById('matricula-turma-select').selectedOptions[0];

    const payload = {
        matricula_aluno: document.getElementById('matricula-aluno').value,
        semestre: turmaOption ? turmaOption.dataset.semestre : '',
        num_turma: turmaOption ? turmaOption.dataset.numTurma : '',
        ano: turmaOption ? turmaOption.dataset.ano : '',
        cod_disciplina: turmaOption ? turmaOption.dataset.codDisciplina : '',
        nota: document.getElementById('matricula-nota').value.trim(),
        frequencia: document.getElementById('matricula-frequencia').value.trim()
    };

    const obrigatorios = ['matricula_aluno', 'semestre', 'num_turma', 'ano', 'cod_disciplina', 'nota', 'frequencia'];
    if (obrigatorios.some(campo => payload[campo] === '')) {
        mostrarToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    await executarComCarregamento(botao, 'Salvando...', async () => {
        if (acao === 'insert') {
            await inserirMatricula(payload);
        } else {
            await alterarMatricula(payload);
        }
    });
});

async function inserirMatricula(payload) {
    try {
        const response = await fetch(`${API_URL}/matriculas/inserir.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Matrícula cadastrada com sucesso!', 'sucesso');
            limparFormularioMatricula();
            listarMatriculas();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function alterarMatricula(payload) {
    try {
        const response = await fetch(`${API_URL}/matriculas/alterar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Matrícula alterada com sucesso!', 'sucesso');
            limparFormularioMatricula();
            listarMatriculas();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function deletarMatricula(matricula_aluno, semestre, num_turma, ano, cod_disciplina) {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;

    try {
        const response = await fetch(`${API_URL}/matriculas/deletar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula_aluno, semestre, num_turma, ano, cod_disciplina })
        });
        const dados = await response.json();

        if (dados.sucesso) {
            mostrarToast('Matrícula removida com sucesso!', 'sucesso');
            listarMatriculas();
        } else {
            mostrarToast(dados.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        mostrarToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

async function listarMatriculas() {
    try {
        const response = await fetch(`${API_URL}/matriculas/listar.php`);
        matriculasCache = await response.json();
        renderizarTabelaMatriculas(matriculasCache);
    } catch (error) {
        console.error('Erro ao carregar matrículas:', error);
        mostrarToast('Erro de conexão ao carregar matrículas.', 'erro');
    }
}

function renderizarTabelaMatriculas(dados) {
    const tbody = document.querySelector('#tabela-matriculas tbody');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = linhaEstadoVazio(8);
        return;
    }

    dados.forEach(matricula => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${matricula.matricula_aluno}</td>
            <td>${matricula.semestre}</td>
            <td>${matricula.num_turma}</td>
            <td>${matricula.ano}</td>
            <td>${matricula.cod_disciplina}</td>
            <td>${formatarDecimal(matricula.nota)}</td>
            <td>${formatarDecimal(matricula.frequencia)}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicaoMatricula(${matricula.matricula_aluno}, ${matricula.semestre}, ${matricula.num_turma}, ${matricula.ano}, '${matricula.cod_disciplina}')">Editar</button>
                <button class="btn-danger" onclick="deletarMatricula(${matricula.matricula_aluno}, ${matricula.semestre}, ${matricula.num_turma}, ${matricula.ano}, '${matricula.cod_disciplina}')">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function prepararEdicaoMatricula(matricula_aluno, semestre, num_turma, ano, cod_disciplina) {
    const matricula = matriculasCache.find(m =>
        m.matricula_aluno == matricula_aluno && m.semestre == semestre &&
        m.num_turma == num_turma && m.ano == ano && m.cod_disciplina == cod_disciplina
    );
    if (!matricula) return;

    document.getElementById('form-title-matricula').innerText = 'Editar Matrícula';
    document.getElementById('matricula-acao').value = 'update';
    document.getElementById('matricula-aluno').value = matricula.matricula_aluno;
    document.getElementById('matricula-aluno').disabled = true;
    document.getElementById('matricula-turma-select').value =
        `${matricula.semestre}_${matricula.num_turma}_${matricula.ano}_${matricula.cod_disciplina}`;
    document.getElementById('matricula-turma-select').disabled = true;
    document.getElementById('matricula-nota').value = matricula.nota;
    document.getElementById('matricula-frequencia').value = matricula.frequencia;

    document.getElementById('btn-cancelar-matricula').classList.remove('hidden');
    document.getElementById('form-matricula').scrollIntoView({ behavior: 'smooth' });
}

function limparFormularioMatricula() {
    document.getElementById('form-matricula').reset();
    document.getElementById('form-title-matricula').innerText = 'Cadastrar Nova Matrícula';
    document.getElementById('matricula-acao').value = 'insert';
    document.getElementById('matricula-aluno').disabled = false;
    document.getElementById('matricula-turma-select').disabled = false;
    document.getElementById('btn-cancelar-matricula').classList.add('hidden');
}

document.getElementById('btn-cancelar-matricula').addEventListener('click', limparFormularioMatricula);

// ==========================================
// 10. RELATÓRIOS DO TP
// ==========================================

async function carregarRelatorio(tipo, botao) {
    const arquivos = {
        'inner-join': 'inner_join.php',
        'outer-join': 'outer_join.php',
        'group-by': 'group_by.php',
        'having': 'having.php',
        'subquery': 'subquery.php'
    };

    await executarComCarregamento(botao, 'Carregando...', async () => {
        try {
            const response = await fetch(`${API_URL}/relatorios/${arquivos[tipo]}`);
            const dados = await response.json();

            if (Array.isArray(dados)) {
                renderizarRelatorio(dados);
            } else if (dados && dados.sucesso === false) {
                exibirErroRelatorio(dados.mensagem);
            } else {
                exibirErroRelatorio('Resposta inesperada do servidor.');
            }
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
            exibirErroRelatorio('Erro de conexão com o servidor. Verifique se o backend está rodando.');
        }
    });
}

function exibirErroRelatorio(mensagem) {
    document.getElementById('relatorio-header').innerHTML = '<th>Erro</th>';
    document.getElementById('relatorio-body').innerHTML = `<tr><td>${mensagem}</td></tr>`;
}

function renderizarRelatorio(dados) {
    const cabecalho = document.getElementById('relatorio-header');
    const corpo = document.getElementById('relatorio-body');

    cabecalho.innerHTML = '';
    corpo.innerHTML = '';

    if (dados.length === 0) {
        corpo.innerHTML = '<tr><td>Nenhum resultado encontrado.</td></tr>';
        return;
    }

    const colunas = Object.keys(dados[0]);

    colunas.forEach(coluna => {
        const th = document.createElement('th');
        th.innerText = coluna;
        cabecalho.appendChild(th);
    });

    dados.forEach(linha => {
        const tr = document.createElement('tr');
        colunas.forEach(coluna => {
            const td = document.createElement('td');
            td.innerText = formatarValor(linha[coluna]);
            tr.appendChild(td);
        });
        corpo.appendChild(tr);
    });
}

// ==========================================
// 11. Carregamento inicial das tabelas e selects
// ==========================================
window.onload = function () {
    listarProfessores();
    listarDepartamentos();
    listarDisciplinas();
    listarCursos();
    listarAlunos();
    listarTurmas();
    listarMatriculas();
};
