CREATE TABLE Paciente (
    idPaciente SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('responsavel', 'filho', 'admin')),
    idResponsavel INT,
    username VARCHAR(100) UNIQUE,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(6) NULL,
    reset_token_expires TIMESTAMP NULL,
    FOREIGN KEY (idResponsavel)
        REFERENCES Paciente(idPaciente)
        ON DELETE SET NULL
);

CREATE TABLE Personagem (
    idPersonagem SERIAL PRIMARY KEY,
    idPaciente INT UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    xp INT DEFAULT 0,
    carboidrato INT DEFAULT 0,
    glicemia INT DEFAULT 0,
    proteina INT DEFAULT 0,
    total_refeicoes INT DEFAULT 0,
    total_refeicoes_saudaveis INT DEFAULT 0,
    FOREIGN KEY (idPaciente)
        REFERENCES Paciente(idPaciente)
        ON DELETE CASCADE
);

CREATE TABLE Missoes (
    idMissao SERIAL PRIMARY KEY,
    idPaciente INT UNIQUE NOT NULL,
    missao1 INT DEFAULT 0,
    missao2 INT DEFAULT 0,
    missao3 INT DEFAULT 0,
    missao4 INT DEFAULT 0,
    FOREIGN KEY (idPaciente)
        REFERENCES Paciente(idPaciente)
        ON DELETE CASCADE
);

CREATE TABLE Conquista (
    idConquista SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    icone VARCHAR(50),
    cor_fundo VARCHAR(20),
    cor_icone VARCHAR(20),
    missoes_necessarias INT NOT NULL
);

CREATE TABLE PacienteConquista (
    idPacienteConquista SERIAL PRIMARY KEY,
    idPaciente INT NOT NULL,
    idConquista INT NOT NULL,
    desbloqueada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idPaciente)
        REFERENCES Paciente(idPaciente)
        ON DELETE CASCADE,
    FOREIGN KEY (idConquista)
        REFERENCES Conquista(idConquista)
        ON DELETE CASCADE,
    UNIQUE (idPaciente, idConquista)
);

CREATE TABLE HistoricoSaude (
    idHistorico SERIAL PRIMARY KEY,
    idPaciente INT NOT NULL,
    carboidrato INT DEFAULT 0,
    glicemia INT DEFAULT 0,
    proteina INT DEFAULT 0,
    eh_saudavel BOOLEAN DEFAULT FALSE,
    registrado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idPaciente)
        REFERENCES Paciente(idPaciente)
        ON DELETE CASCADE
);

CREATE INDEX idx_historico_paciente_data
ON HistoricoSaude (idPaciente, registrado_em);

INSERT INTO Conquista (
    nome,
    descricao,
    icone,
    cor_fundo,
    cor_icone,
    missoes_necessarias
) VALUES
('1ª Refeição', 'Registrou sua primeira refeição', 'restaurant', '#FFF9C4', '#E53935', 0),
('5 Refeições', '5 refeições saudáveis registradas', 'flame', '#FFF3E0', '#FF6D00', 5),
('10 Refeições', '10 refeições saudáveis registradas', 'star', '#E8F5E9', '#2E7D32', 10),
('25 Refeições', '25 refeições saudáveis — incrível!', 'trophy', '#FBE9E7', '#FF5722', 25)
ON CONFLICT DO NOTHING;