const form = document.getElementById('investment-form');
const ativosList = document.getElementById('ativos-list');
const graficoCtx = document.getElementById('graficoPizza').getContext('2d');

let ativos = JSON.parse(localStorage.getItem('ativos')) || [];

function salvarDados() {
  localStorage.setItem('ativos', JSON.stringify(ativos));
}

function calcularCarteiraIdeal() {
  const totalNotas = ativos.reduce((soma, ativo) => soma + ativo.nota, 0);
  return ativos.map(ativo => {
    const ideal = (ativo.nota / totalNotas) * ativos.reduce((s, a) => s + a.saldo, 0);
    return { ...ativo, ideal: ideal.toFixed(2) };
  });
}

function renderAtivos() {
  ativosList.innerHTML = '';
  const atualizados = calcularCarteiraIdeal();
  atualizados.forEach((ativo, index) => {
    const div = document.createElement('div');
    div.className = 'ativo';
    div.innerHTML = `
      <strong>${ativo.nome}</strong> - R$ ${ativo.saldo} | Nota: ${ativo.nota} | Ideal: R$ ${ativo.ideal}
      <button onclick="removerAtivo(${index})">Remover</button>
    `;
    ativosList.appendChild(div);
  });
  renderGrafico(atualizados);
}

function renderGrafico(dados) {
  const chartData = {
    labels: dados.map(a => a.nome),
    datasets: [{
      label: 'Distribuição atual',
      data: dados.map(a => a.saldo),
      backgroundColor: ['#f39c12', '#2980b9', '#27ae60', '#8e44ad', '#e74c3c']
    }]
  };

  if (window.pizzaChart) window.pizzaChart.destroy();
  window.pizzaChart = new Chart(graficoCtx, {
    type: 'pie',
    data: chartData
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('ativo').value;
  const preco = parseFloat(document.getElementById('preco').value);
  const nota = parseFloat(document.getElementById('nota').value);
  const saldo = parseFloat(document.getElementById('saldo').value);
  ativos.push({ nome, preco, nota, saldo });
  salvarDados();
  renderAtivos();
  form.reset();
});

function removerAtivo(index) {
  ativos.splice(index, 1);
  salvarDados();
  renderAtivos();
}

renderAtivos();
