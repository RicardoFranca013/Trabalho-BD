CREATE TABLE DEPARTAMENTO
(
  nome_departamento VARCHAR2(100) NOT NULL,
  cod_departamento NUMBER NOT NULL,
  telefone VARCHAR2(20) NOT NULL,
  sala VARCHAR2(20) NOT NULL,
  bloco VARCHAR2(20) NOT NULL,
  campus VARCHAR2(100) NOT NULL,
  PRIMARY KEY (cod_departamento),
  UNIQUE (nome_departamento)
);

CREATE TABLE PROFESSOR
(
  nome VARCHAR2(100) NOT NULL,
  matricula NUMBER NOT NULL,
  titulo VARCHAR2(50) NOT NULL,
  PRIMARY KEY (matricula)
);


CREATE TABLE CURSO
(
  cod_curso NUMBER NOT NULL,
  nome VARCHAR2(100) NOT NULL,
  carga_horaria NUMBER NOT NULL,
  cod_departamento NUMBER NOT NULL,
  matricula_coordenador NUMBER NOT NULL,
  PRIMARY KEY (cod_curso),
  FOREIGN KEY (cod_departamento) REFERENCES DEPARTAMENTO(cod_departamento),
  FOREIGN KEY (matricula_coordenador) REFERENCES PROFESSOR(matricula)
);

CREATE TABLE ALUNO
(
  categoria VARCHAR2(50) NOT NULL,
  matricula NUMBER NOT NULL,
  nome VARCHAR2(100) NOT NULL,
  data_nascimento DATE NOT NULL,
  nivel VARCHAR2(20) NOT NULL,
  sexo CHAR(1) NOT NULL,
  cod_curso NUMBER NOT NULL,
  status VARCHAR2(20) NOT NULL,
  rendimento NUMBER(5,2),
  logradouro VARCHAR2(100) NOT NULL,
  bairro VARCHAR2(100) NOT NULL,
  cep VARCHAR2(10) NOT NULL,
  numero NUMBER NOT NULL,
  estado VARCHAR2(2) NOT NULL,
  cidade VARCHAR2(100) NOT NULL,
  PRIMARY KEY (matricula),
  FOREIGN KEY (cod_curso) REFERENCES CURSO(cod_curso)
);

CREATE TABLE DISCIPLINA
(
  creditos NUMBER NOT NULL,
  nome VARCHAR2(100) NOT NULL,
  cod_disciplina NUMBER NOT NULL,
  PRIMARY KEY (cod_disciplina)
);

CREATE TABLE TURMA
(
  sala VARCHAR2(20) NOT NULL,
  semestre NUMBER(1) NOT NULL,
  vagas NUMBER NOT NULL,
  num_turma NUMBER NOT NULL,
  ano NUMBER(4) NOT NULL,
  matricula_professor NUMBER NOT NULL, 
  cod_disciplina NUMBER NOT NULL,
  PRIMARY KEY (semestre, num_turma, ano, cod_disciplina),
  FOREIGN KEY (matricula_professor) REFERENCES PROFESSOR(matricula),
  FOREIGN KEY (cod_disciplina) REFERENCES DISCIPLINA(cod_disciplina)
);

CREATE TABLE MATRICULA
(
  nota NUMBER(5,2) NOT NULL,
  frequencia NUMBER(5,2) NOT NULL,
  matricula_aluno NUMBER NOT NULL, 
  semestre NUMBER(1) NOT NULL,
  num_turma NUMBER NOT NULL,
  ano NUMBER(4) NOT NULL,
  cod_disciplina NUMBER NOT NULL,  
  PRIMARY KEY (matricula_aluno, semestre, num_turma, ano, cod_disciplina),
  FOREIGN KEY (matricula_aluno) REFERENCES ALUNO(matricula),
  FOREIGN KEY (semestre, num_turma, ano, cod_disciplina) REFERENCES TURMA(semestre, num_turma, ano, cod_disciplina)
);

CREATE TABLE COMPOE
(
  cod_curso NUMBER NOT NULL,
  cod_disciplina NUMBER NOT NULL,
  PRIMARY KEY (cod_curso, cod_disciplina),
  FOREIGN KEY (cod_curso) REFERENCES CURSO(cod_curso),
  FOREIGN KEY (cod_disciplina) REFERENCES DISCIPLINA(cod_disciplina)
);

CREATE OR REPLACE TRIGGER valida_carga_horaria
BEFORE INSERT OR UPDATE ON CURSO
FOR EACH ROW
BEGIN
   IF :NEW.carga_horaria <= 100 THEN
      RAISE_APPLICATION_ERROR(-20001, 'A carga horária do curso deve ser maior que zero');
   END IF;
END;
/

CREATE OR REPLACE TRIGGER valida_sexo_aluno
BEFORE INSERT OR UPDATE ON ALUNO
FOR EACH ROW
BEGIN
   IF :NEW.sexo NOT IN ('M', 'F') THEN
      RAISE_APPLICATION_ERROR(-20002, 'O campo sexo deve ser obrigatóriamente ''M'' ou ''F''');
   END IF;
END;
/

CREATE OR REPLACE TRIGGER valida_creditos_disciplina
BEFORE INSERT OR UPDATE ON DISCIPLINA
FOR EACH ROW
BEGIN
   IF :NEW.creditos <= 0 THEN
      RAISE_APPLICATION_ERROR(-20003, 'A disciplina precisa ter uma quantidade de créditos maior que zero');
   END IF;
END;
/

CREATE OR REPLACE TRIGGER valida_dados_turma
BEFORE INSERT OR UPDATE ON TURMA
FOR EACH ROW
BEGIN
   IF :NEW.semestre NOT IN (1, 2) THEN
      RAISE_APPLICATION_ERROR(-20004, 'O semestre acadêmico deve ser 1 ou 2');
   END IF;

   IF :NEW.vagas <= 0 THEN
      RAISE_APPLICATION_ERROR(-20005, 'O número de vagas da turma deve ser maior que a zero');
   END IF;

   IF :NEW.ano <= 2026 THEN
      RAISE_APPLICATION_ERROR(-20006, 'O ano da turma deve ser igual ou acima de 2026');
   END IF;
END;
/

CREATE OR REPLACE TRIGGER valida_desempenho_matricula
BEFORE INSERT OR UPDATE ON MATRICULA
FOR EACH ROW
BEGIN
   IF :NEW.nota NOT BETWEEN 0 AND 100 THEN
      RAISE_APPLICATION_ERROR(-20007, 'A nota do aluno deve estar entre 0 e 100');
   END IF;

   IF :NEW.frequencia NOT BETWEEN 0 AND 100 THEN
      RAISE_APPLICATION_ERROR(-20008, 'A frequência do aluno deve estar entre 0 e 100');
   END IF;
END;
/

CREATE OR REPLACE TRIGGER bloqueia_turma_lotada
BEFORE INSERT ON MATRICULA
FOR EACH ROW
DECLARE
   vagas_totais INT;
   vagas_ocupadas INT;
BEGIN
   SELECT vagas INTO vagas_totais 
   FROM TURMA 
   WHERE semestre = :NEW.semestre 
     AND num_turma = :NEW.num_turma 
     AND ano = :NEW.ano 
     AND cod_disciplina = :NEW.cod_disciplina;

   SELECT COUNT(*) INTO vagas_ocupadas 
   FROM MATRICULA 
   WHERE semestre = :NEW.semestre 
     AND num_turma = :NEW.num_turma 
     AND ano = :NEW.ano 
     AND cod_disciplina = :NEW.cod_disciplina;

   IF vagas_ocupadas >= vagas_totais THEN
      RAISE_APPLICATION_ERROR(-20010, 'A turma selecionada já está lotada');
   END IF;
END;
/

CREATE OR REPLACE TRIGGER valida_status_permitidos
BEFORE INSERT OR UPDATE ON ALUNO
FOR EACH ROW
BEGIN
   :NEW.status := UPPER(:NEW.status);

   IF :NEW.status NOT IN ('ATIVO', 'TRANCADO', 'FORMADO', 'INATIVO') THEN
      RAISE_APPLICATION_ERROR(-20015, 'Os valores permitidos são - ATIVO, TRANCADO, FORMADO, INATIVO');
   END IF;
END;
/

CREATE OR REPLACE TRIGGER bloqueia_matricula_por_status
BEFORE INSERT ON MATRICULA
FOR EACH ROW
DECLARE
   status_aluno VARCHAR2(20);
BEGIN
   SELECT status INTO status_aluno
   FROM ALUNO
   WHERE matricula = :NEW.matricula_aluno;

   IF status_aluno IN ('TRANCADO', 'FORMADO', 'INATIVO') THEN
      RAISE_APPLICATION_ERROR(-20016, 'Nao e possível matricular o aluno: status - '' || v_status_aluno || ''');
   END IF;
END;
/