// detalhes.js
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

console.log("ID do lugar:", id);

const detalhes = document.getElementById("detalhes");
if (id) {
  fetch(`http://localhost:3000/locais/${id}`)
    .then(response => {
      if (!response.ok) throw new Error("Erro ao buscar o lugar");
      return response.json();
    })
    .then(lugar => {
      const horacorreta = formatarHorario(lugar.horario_funcionamento || "—");
      const numCorreto = formatarContato(lugar.contato || "—")
      detalhes.innerHTML = `
        <h1>${lugar.nome_local}</h1>
        <p><strong class="categoria">Categoria:</strong> ${lugar.categoria || "—"}</p>

        <div class="foto" 
             style="background-image: url('${lugar.imagem || ""}');
                    background-size: cover; 
                    background-position: center;">
        </div>

        <section class="info">
          <h2>O que esse lugar oferece:</h2>
          <p>${lugar.descricao}</p>

          <h2>Horário de funcionamento:</h2>
          <p>${horacorreta}</p>

          <h2>Endereço:</h2>
          <p>${lugar.endereco || "—"}</p>

          <h2>Contato:</h2>
          <p>${numCorreto}</p>
        </section>
      `;
    })
    .catch(error => {
      console.error(error);
      detalhes.innerHTML = "<p>Erro ao carregar os detalhes do lugar.</p>";
    });
} else {
  detalhes.innerHTML = "<p>Nenhum ID encontrado.</p>";
}

function formatarHorario(horario) {
  // Garante que tem pelo menos 9 caracteres e contém os dois horários
  if (!horario || horario.length < 9) return horario;

  // Pega os dois horários separados
  const inicio = horario.slice(0, 5);  // "07:00"
  const fim = horario.slice(5);        // "23:00"

  // Retorna formatado
  return `${inicio} às ${fim}`;
}
function formatarContato(Contato) {
  // Garante que tem pelo menos 9 caracteres e contém os dois horários
  if (!Contato || Contato.length < 5) return Contato;

  // Pega os dois horários separados
  const inicio = Contato.slice(0, 2);  // "07:00"
  const fim = Contato.slice(2);        // "23:00"

  // Retorna formatado
  return `(${inicio})-${fim}`;
}