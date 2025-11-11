function getDiasSelecionados() {
  const selecionados = document.querySelectorAll('.dias-checkbox input[type="checkbox"]:checked');
  return Array.from(selecionados).map(dia => dia.value);
}

//////////////////////////////////////////////////////////////////////////////////////////

let imagemBase64 = ""; // variável global para armazenar a imagem

// Preview da imagem + salvar base64
document.getElementById("imagem-local").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById("preview").src = event.target.result; // mostra a imagem
      imagemBase64 = event.target.result; // guarda a imagem em base64
    };
    reader.readAsDataURL(file); // converte para Base64
  }
});
// Seleção de categoria
const categorias = document.querySelectorAll(".cat");
categorias.forEach(btn => {
  btn.addEventListener("click", () => {
    categorias.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});
document.querySelectorAll(".check").forEach(chk => {
  chk.addEventListener("click", () => {
    // Seleciona todos os checkboxes marcados
    const selecionados = document.querySelectorAll(
      '.dias-checkbox input[type="checkbox"]:checked'
    );

    // Pega só os valores (domingo, segunda, terça...)
    const dias = Array.from(selecionados)
      .map(chk => chk.value)
      .join(","); 

    console.log("Dias selecionados:", dias);
  });
});

// Botão salvar
document.getElementById("salvar").addEventListener("click", async (e) => {
  e.preventDefault;
  const dias = getDiasSelecionados();
  console.log('Dias selecionados:', dias);
  const dados = {
    id_usuario: localStorage.getItem("idUsuario"),
    nome_local: document.getElementById("nome").value,
    categoria: document.querySelector(".cat.active")?.innerText || null,
    endereco: document.getElementById("endereco").value,
    cidade: document.getElementById("cidade").value,
    horario_funcionamento: document.getElementById("abre").value + document.getElementById("fecha").value,
    descricao: document.getElementById("descricao").value,
    contato: document.getElementById("contato").value,
    imagem: imagemBase64, // envia a imagem em Base64
    dias: dias,
  };
  console.log('Dias selecionados:', dados);
  try {
    const resposta = await fetch("http://192.168.1.27:3000/novolocal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    if (resposta.status === 201) {
      alert("Local cadastrado com sucesso!");

      // Limpa os campos
      document.getElementById("nome").value = "";
      document.getElementById("descricao").value = "";
      document.getElementById("abre").value = "";
      document.getElementById("fecha").value = "";
      document.getElementById("contato").value = "";
      document.getElementById("endereco").value = "";
      document.getElementById("preview").src = "";
      categorias.forEach(b => b.classList.remove("active"));

    } else {
      alert("Erro ao cadastrar local!");
    }

  } catch (error) {
    console.error("Erro na requisição:", erro);
    alert("Falha na comunicação com o servidor.");
  }
});