

-- 1) DEPARTAMENTO
INSERT INTO DEPARTAMENTO (cod_departamento, nome_departamento, telefone, sala, bloco, campus) VALUES (1, 'Departamento de Computacao', '3138192000', 'S101', 'Bloco A', 'Campus I');
INSERT INTO DEPARTAMENTO (cod_departamento, nome_departamento, telefone, sala, bloco, campus) VALUES (2, 'Departamento de Engenharia Eletrica', '3138192001', 'S102', 'Bloco A', 'Campus I');
INSERT INTO DEPARTAMENTO (cod_departamento, nome_departamento, telefone, sala, bloco, campus) VALUES (3, 'Departamento de Matematica', '3138192002', 'S201', 'Bloco B', 'Campus I');
INSERT INTO DEPARTAMENTO (cod_departamento, nome_departamento, telefone, sala, bloco, campus) VALUES (4, 'Departamento de Fisica', '3138192003', 'S202', 'Bloco B', 'Campus I');
INSERT INTO DEPARTAMENTO (cod_departamento, nome_departamento, telefone, sala, bloco, campus) VALUES (5, 'Departamento de Administracao', '3138192004', 'S301', 'Bloco C', 'Campus II');

-- 2) PROFESSOR
INSERT INTO PROFESSOR (matricula, nome, titulo) VALUES (1001, 'Joao Silva', 'Doutor');
INSERT INTO PROFESSOR (matricula, nome, titulo) VALUES (1002, 'Maria Santos', 'Mestre');
INSERT INTO PROFESSOR (matricula, nome, titulo) VALUES (1003, 'Carlos Oliveira', 'Doutor');
INSERT INTO PROFESSOR (matricula, nome, titulo) VALUES (1004, 'Ana Costa', 'Doutor');
INSERT INTO PROFESSOR (matricula, nome, titulo) VALUES (1005, 'Pedro Almeida', 'Mestre');

-- 3) CURSO (carga_horaria precisa ser > 100 por causa do trigger valida_carga_horaria)
INSERT INTO CURSO (cod_curso, nome, carga_horaria, cod_departamento, matricula_coordenador) VALUES (1, 'Engenharia de Computacao', 3600, 1, 1001);
INSERT INTO CURSO (cod_curso, nome, carga_horaria, cod_departamento, matricula_coordenador) VALUES (2, 'Engenharia Eletrica', 3800, 2, 1002);
INSERT INTO CURSO (cod_curso, nome, carga_horaria, cod_departamento, matricula_coordenador) VALUES (3, 'Licenciatura em Matematica', 3200, 3, 1003);
INSERT INTO CURSO (cod_curso, nome, carga_horaria, cod_departamento, matricula_coordenador) VALUES (4, 'Fisica', 3000, 4, 1004);
INSERT INTO CURSO (cod_curso, nome, carga_horaria, cod_departamento, matricula_coordenador) VALUES (5, 'Administracao', 3600, 5, 1005);

-- 4) DISCIPLINA
INSERT INTO DISCIPLINA (cod_disciplina, creditos, nome) VALUES (1, 4, 'Banco de Dados I');
INSERT INTO DISCIPLINA (cod_disciplina, creditos, nome) VALUES (2, 4, 'Algoritmos e Programacao');
INSERT INTO DISCIPLINA (cod_disciplina, creditos, nome) VALUES (3, 6, 'Calculo I');
INSERT INTO DISCIPLINA (cod_disciplina, creditos, nome) VALUES (4, 4, 'Fisica Geral');
INSERT INTO DISCIPLINA (cod_disciplina, creditos, nome) VALUES (5, 4, 'Estrutura de Dados');

-- 5) ALUNO (sexo M/F, status sera forcado a maiusculo pelo trigger valida_status_permitidos)
INSERT INTO ALUNO (categoria, matricula, nome, data_nascimento, nivel, sexo, cod_curso, status, rendimento, logradouro, bairro, cep, numero, estado, cidade)
VALUES ('Regular', 2027001, 'Lucas Ferreira', TO_DATE('2005-03-14','YYYY-MM-DD'), 'Graduacao', 'M', 1, 'ATIVO', 85.5, 'Rua das Flores', 'Centro', '30130000', 120, 'MG', 'Belo Horizonte');
INSERT INTO ALUNO (categoria, matricula, nome, data_nascimento, nivel, sexo, cod_curso, status, rendimento, logradouro, bairro, cep, numero, estado, cidade)
VALUES ('Regular', 2027002, 'Beatriz Souza', TO_DATE('2004-07-22','YYYY-MM-DD'), 'Graduacao', 'F', 2, 'ATIVO', 78.2, 'Av. Amazonas', 'Barro Preto', '30180000', 850, 'MG', 'Belo Horizonte');
INSERT INTO ALUNO (categoria, matricula, nome, data_nascimento, nivel, sexo, cod_curso, status, rendimento, logradouro, bairro, cep, numero, estado, cidade)
VALUES ('Regular', 2027003, 'Rafael Lima', TO_DATE('2003-11-05','YYYY-MM-DD'), 'Graduacao', 'M', 1, 'TRANCADO', 60.0, 'Rua Goias', 'Lourdes', '30140000', 45, 'MG', 'Belo Horizonte');
INSERT INTO ALUNO (categoria, matricula, nome, data_nascimento, nivel, sexo, cod_curso, status, rendimento, logradouro, bairro, cep, numero, estado, cidade)
VALUES ('Regular', 2027004, 'Camila Rocha', TO_DATE('2005-01-30','YYYY-MM-DD'), 'Graduacao', 'F', 3, 'ATIVO', 92.3, 'Rua Curitiba', 'Funcionarios', '30150000', 300, 'MG', 'Belo Horizonte');
INSERT INTO ALUNO (categoria, matricula, nome, data_nascimento, nivel, sexo, cod_curso, status, rendimento, logradouro, bairro, cep, numero, estado, cidade)
VALUES ('Regular', 2027005, 'Thiago Martins', TO_DATE('2002-09-18','YYYY-MM-DD'), 'Graduacao', 'M', 4, 'FORMADO', 88.0, 'Rua Bahia', 'Centro', '30160000', 500, 'MG', 'Belo Horizonte');

-- 6) TURMA (semestre 1 ou 2, ano >= 2027 por causa do trigger valida_dados_turma, vagas > 0)
INSERT INTO TURMA (sala, semestre, vagas, num_turma, ano, matricula_professor, cod_disciplina) VALUES ('B201', 1, 30, 1, 2027, 1001, 1);
INSERT INTO TURMA (sala, semestre, vagas, num_turma, ano, matricula_professor, cod_disciplina) VALUES ('B202', 1, 25, 1, 2027, 1002, 2);
INSERT INTO TURMA (sala, semestre, vagas, num_turma, ano, matricula_professor, cod_disciplina) VALUES ('B301', 2, 40, 1, 2027, 1003, 3);
INSERT INTO TURMA (sala, semestre, vagas, num_turma, ano, matricula_professor, cod_disciplina) VALUES ('B203', 1, 20, 2, 2027, 1001, 1);
INSERT INTO TURMA (sala, semestre, vagas, num_turma, ano, matricula_professor, cod_disciplina) VALUES ('B302', 2, 35, 1, 2027, 1004, 5);

-- 7) COMPOE
INSERT INTO COMPOE (cod_curso, cod_disciplina) VALUES (1, 1);
INSERT INTO COMPOE (cod_curso, cod_disciplina) VALUES (1, 5);
INSERT INTO COMPOE (cod_curso, cod_disciplina) VALUES (2, 3);
INSERT INTO COMPOE (cod_curso, cod_disciplina) VALUES (3, 3);
INSERT INTO COMPOE (cod_curso, cod_disciplina) VALUES (1, 2);

-- 8) MATRICULA (nota/frequencia 0-100; trigger bloqueia_matricula_por_status exige aluno
--    com status diferente de TRANCADO/FORMADO/INATIVO, por isso usamos só 2027001, 2027002 e 2027004)
INSERT INTO MATRICULA (nota, frequencia, matricula_aluno, semestre, num_turma, ano, cod_disciplina) VALUES (85.0, 90.0, 2027001, 1, 1, 2027, 1);
INSERT INTO MATRICULA (nota, frequencia, matricula_aluno, semestre, num_turma, ano, cod_disciplina) VALUES (78.0, 88.0, 2027002, 1, 1, 2027, 2);
INSERT INTO MATRICULA (nota, frequencia, matricula_aluno, semestre, num_turma, ano, cod_disciplina) VALUES (92.0, 95.0, 2027004, 2, 1, 2027, 3);
INSERT INTO MATRICULA (nota, frequencia, matricula_aluno, semestre, num_turma, ano, cod_disciplina) VALUES (70.0, 80.0, 2027001, 1, 2, 2027, 1);
INSERT INTO MATRICULA (nota, frequencia, matricula_aluno, semestre, num_turma, ano, cod_disciplina) VALUES (65.0, 75.0, 2027002, 2, 1, 2027, 5);

COMMIT;