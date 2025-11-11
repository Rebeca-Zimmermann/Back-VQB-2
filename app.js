import express from "express";
import cors from "cors";
import sql from "./database.js";
import { CriarHash, CompararHash } from "./util.js";

const app = express();

// Permite JSON maior (até 50MB) e formulários grandes
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cors());


// Rota de cadastro ✅
app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ erro: "Nome, email e senha são obrigatórios." });
    }

    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{6,}$/;
    if (!senhaRegex.test(senha)) {
        return res.status(400).json({ erro: "Senha fraca! Ela deve ter letras maiúsculas, minúsculas, número e caractere especial, mínimo 6 caracteres" })
        };

    // Verifica se o email já existe
    const verificacao =
      await sql`SELECT * FROM usuario WHERE email = ${email}`;
    if (verificacao.length > 0) {
      return res.status(409).json({ erro: "Email já cadastrado." });
    }

    // Cria hash da senha
    const hash = await CriarHash(senha, 10);

    // Insere o novo usuário no banco
    const novoUsuario = await sql`
      INSERT INTO usuario (nome_usuario, senha, funcao, email)
      VALUES (${nome}, ${hash}, 'user', ${email})
      RETURNING id_usuario, nome_usuario, email 
    `;

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: novoUsuario[0],
    });
  } catch (error) {
    console.error("Erro inesperado:", error);
    return res.status(500).json({ erro: "Ocorreu um erro inesperado" });
  }
});

// Rota de login ✅
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: "nome e senha são obrigatórios." });
    }

    // Verifica se o usuário existe
    const usuario = await sql`SELECT * FROM usuario WHERE email = ${email}`;
    if (usuario.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado." });
    }

    // Confere senha
    const senhaCorreta = await CompararHash(senha, usuario[0].senha);
    console.log(senhaCorreta);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    return res.status(200).json(usuario[0],{mensagem: "Login realizado com sucesso!"});
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

// Rota para exibir usuário por ID ✅
app.get("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    

    // Busca usuário no banco
    const usuario = await sql`
      SELECT *
      FROM usuario
      WHERE id_usuario = ${id}


    `;

    if (usuario.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    return res.status(201).json(usuario[0]);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

// Listar locais cadastrados - PÁGINA DAS CIDADES ✅
app.get("/cidades/:cidade", async (req, res) => {
   const { cidade } = req.params;

  console.log(cidade)
  try {
    const locais = await sql`
      SELECT * FROM Local where cidade = ${cidade}
    `;
    return res.status(200).json(locais);
  } catch (error) {
    console.error("Erro ao listar locais:", error);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

// Exibir detalhes de um local ✅
app.get("/locais/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const local = await sql`
    SELECT * FROM local WHERE id_local = ${id};     
    `;

    if (local.length === 0) {
      return res.status(404).json({ erro: "Local não encontrado." });
    }

    return res.status(200).json(local[0]);
  } catch (error) {
    console.error("Erro ao buscar local:", error);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

// Inserir novo local ✅
app.post("/novolocal", async (req, res) => {
  try {
    const {
      id_usuario,
      nome_local,
      categoria,
      endereco,
      cidade,
      horario_funcionamento,
      descricao,
      contato,
      imagem,
      dias
    } = req.body;

    // Inserir no banco
    const novoLocal = await sql`
        INSERT INTO local( id_usuario, nome_local, categoria, endereco, cidade, horario_funcionamento, descricao, contato, imagem, dias)
	VALUES (${id_usuario}, ${nome_local}, ${categoria}, ${endereco},${cidade}, ${horario_funcionamento}, ${descricao}, ${contato}, ${imagem}, ${dias})
   RETURNING nome_local, categoria, endereco, cidade, horario_funcionamento, descricao, contato, imagem, dias;
    `;

    return res.status(201).json({
      mensagem: "Local cadastrado com sucesso!"
    });
  } catch (error) {
    console.error("Erro ao cadastrar local:", error);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

//PERFIL ✅
app.get("/perfil/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Busca usuário no banco
    const usuario = await sql`

    SELECT * FROM usuario WHERE id_usuario = ${id}`;

    if (usuario.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    return res.status(201).json(usuario[0]);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

//ALTERA A IMAGEM NO BANCO ✅
app.put('/usuario/foto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { foto_usuario } = req.body;

    // Verifica se veio algo no corpo
    if (!foto_usuario) {
      return res.status(400).json({ erro: 'Nenhuma foto enviada.' });
    }

    // Atualiza a imagem no banco
    await sql`
      UPDATE usuario
      SET foto_usuario = ${foto_usuario}
      WHERE id_usuario = ${id};
    `;

    return res.status(200).json({ mensagem: 'Imagem atualizada com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar imagem:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

//ALTERAR DESCRIÇÃO DO USUÁRIO ✅
app.put('/usuario/descricao/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao } = req.body;

    // Atualiza a descrição no banco
    await sql`
      UPDATE usuario
      SET biografia = ${descricao}
      WHERE id_usuario = ${id};
    `;

    return res.status(200).json({ mensagem: 'Descrição atualizada com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar descrição:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

//ROTA GET - PUXAR LOCAIS COM BASE NO ID DO DONO  ✅
app.get("/locais/usuario/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const locais = await sql`
      SELECT id_local, nome_local, categoria, imagem
      FROM local
      WHERE id_usuario = ${id_usuario}
    `;

    if (locais.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(locais);
  } catch (erro) {
    console.error("Erro ao buscar locais do usuário:", erro);
    res.status(500).json({ erro: "Erro interno ao buscar locais." });
  }
});

//ROTA PUT - EDIÇÃO DOS LOCAIS ✅
app.put("/locais/:id_local", async (req, res) => {
  const { id_local } = req.params;
  const { id_usuario, nome_local, descricao, categoria, imagem } = req.body;

  try {
    // Busca função do usuário e o dono do local
    const usuario = await sql`SELECT funcao FROM Usuario WHERE id_usuario = ${id_usuario}`;
    const local = await sql`SELECT id_usuario FROM Local WHERE id_local = ${id_local}`;

    if (usuario.length === 0 || local.length === 0){
      return res.status(404).json({ erro: "Usuário ou local não encontrado." });
    }

    const funcao = usuario[0].funcao;
    const donoDoLocal = local[0].id_usuario;
    // Verifica permissão
    if(funcao != "admin" && donoDoLocal != id_usuario) {
      return res.status(403).json({ erro: "Você não tem permissão para editar este local." });
    }
    // Atualiza o local
    await sql`
      UPDATE local 
      SET 
        nome_local = ${nome_local}, 
        descricao = ${descricao}, 
        categoria = ${categoria}, 
        imagem = ${imagem}
      WHERE id_local = ${id_local}
    `;

   return res.status(200).json({ mensagem: "Local atualizado com sucesso!" });
  } catch (erro) {
    console.error("Erro ao atualizar local:", erro);
    return res.status(500).json({ erro: "Erro interno ao atualizar local." });
  }
});

//ROTA DELETE - APAGAR OS LOCAIS ✅
app.delete("/locais/:id_local", async (req, res) => {
  const { id_local } = req.params;
  const { id_usuario } = req.body;

  if (!id_usuario)
    return res.status(400).json({ erro: "Usuário não informado." });

  try {
    const usuario = await sql`SELECT funcao FROM Usuario WHERE id_usuario = ${id_usuario}`;
    const local = await sql`SELECT id_usuario FROM Local WHERE id_local = ${id_local}`;

    if (usuario.length === 0 || local.length === 0)
      return res.status(404).json({ erro: "Usuário ou local não encontrado." });

    const funcao = usuario[0].funcao;
    const donoDoLocal = local[0].id_usuario;

    // Verifica permissão
    if (funcao != "prefeitura" && donoDoLocal != id_usuario) {
      return res.status(403).json({ erro: "Você não tem permissão para excluir este local." });
    }

    await sql`DELETE FROM Local WHERE id_local = ${id_local}`;

    res.status(200).json({ mensagem: "Local excluído com sucesso!" });
  } catch (erro) {
    console.error("Erro ao excluir local:", erro);
    res.status(500).json({ erro: "Erro interno ao excluir local." });
  }
});

//ROTA PUXAR LOCAIS ✅
app.get("/locais", async (req, res) => {
  try {
    const locais = await sql`
      SELECT * FROM local
    `;

    res.status(200).json(locais);
  } catch (erro) {
    console.error("Erro ao buscar locais:", erro);
    res.status(500).json({ erro: "Erro interno ao buscar locais." });
  }
});

//ROTA POST - COMENTÁRIOS ✅
app.post("/comentarios", async (req, res) => {
  try {
    const { id_usuario, id_local, texto } = req.body;

    if (!id_usuario || !id_local || !texto) {
      return res.status(400).json({ erro: "Campos obrigatórios ausentes." });
    }

    await sql`
      INSERT INTO comentario (id_usuario, id_local, texto)
      VALUES (${id_usuario}, ${id_local}, ${texto})
    `;

    res.status(201).json({ mensagem: "Comentário adicionado com sucesso!" });
  } catch (erro) {
    console.error("Erro ao adicionar comentário:", erro);
    res.status(500).json({ erro: "Erro interno ao adicionar comentário." });
  }
});

//ROTA GET - COMENTÁRIOS ✅
app.get("/comentarios/:id_local", async (req, res) => {
  try {
    const { id_local } = req.params;

    const comentarios = await sql`
      SELECT c.texto, c.data_criacao, u.nome_usuario
      FROM comentario c
      JOIN Usuario u ON c.id_usuario = u.id_usuario
      WHERE c.id_local = ${id_local}
      ORDER BY c.data_criacao DESC
    `;

    res.status(200).json(comentarios);

  } catch (erro) {
    console.error("Erro ao buscar comentários:", erro);
    res.status(500).json({ erro: "Erro interno ao buscar comentários." });
  }
});

app.listen(3000, () => {
  console.log("API está no ar!");
});