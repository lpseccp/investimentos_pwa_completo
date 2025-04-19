let ativos = JSON.parse(localStorage.getItem('carteira')) || [];

function salvarCarteira() {
    localStorage.setItem('carteira', JSON.stringify(ativos));
}

function calcularCarteira() {
    const totalNota = ativos.reduce((acc, a) => acc + a.nota, 0);
    return ativos.map(a => {
        a.percentualIdeal = (a.nota / totalNota) * 100;
        a.valorIdeal = a.percentualIdeal * a.totalCarteira / 100;
        a.diferenca = a.valorIdeal - a.saldo;
        return a;
    });
}

function atualizarInterface() {
    document.getElementById("listaAtivos").innerHTML = '';
    ativos = calcularCarteira();
    ativos.forEach((a, i) => {
        document.getElementById("listaAtivos").innerHTML += `
            <div>
                <strong>${a.ativo}</strong> - Saldo: R$${a.saldo.toFixed(2)} | Ideal: R$${a.valorIdeal.toFixed(2)} | Diferença: R$${a.diferenca.toFixed(2)}
                <button onclick="removerAtivo(${i})">Remover</button>
            </div>`;
    });
    gerarGraficos();
    salvarCarteira();
}

document.getElementById("investmentForm").onsubmit = function(e) {
    e.preventDefault();
    const ativo = document.getElementById("ativo").value;
    const preco = parseFloat(document.getElementById("preco").value);
    const nota = parseInt(document.getElementById("nota").value);
    const saldo = parseFloat(document.getElementById("saldo").value);
    ativos.push({ ativo, preco, nota, saldo, totalCarteira: totalCarteiraAtual() });
    atualizarInterface();
    this.reset();
};

function removerAtivo(index) {
    ativos.splice(index, 1);
    atualizarInterface();
}

function totalCarteiraAtual() {
    return ativos.reduce((acc, a) => acc + a.saldo, 0);
}

function gerarGraficos() {
    const labels = ativos.map(a => a.ativo);
    const dados = ativos.map(a => a.saldo);
    const metas = ativos.map(a => a.valorIdeal);

    new Chart(document.getElementById('graficoPizza'), {
        type: 'pie',
        data: { labels, datasets: [{ label: 'Distribuição', data: dados }] },
        options: {}
    });

    new Chart(document.getElementById('graficoBarra'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Atual', data: dados, backgroundColor: 'blue' },
                { label: 'Ideal', data: metas, backgroundColor: 'green' }
            ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

function filtrarPor(campo) {
    ativos.sort((a, b) => b[campo] - a[campo]);
    atualizarInterface();
}

function copiarBackup() {
    navigator.clipboard.writeText(JSON.stringify(ativos)).then(() => alert('Copiado!'));
}

function restaurarBackup() {
    const json = prompt("Cole o JSON da carteira:");
    if (json) {
        try {
            ativos = JSON.parse(json);
            atualizarInterface();
        } catch {
            alert("Erro ao importar.");
        }
    }
}

function exportarCSV() {
    let csv = "Ativo,Preço,Nota,Saldo\n";
    ativos.forEach(a => {
        csv += `${a.ativo},${a.preco},${a.nota},${a.saldo}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carteira.csv";
    a.click();
}

function importarCSV(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        const linhas = reader.result.split("\n").slice(1);
        linhas.forEach(l => {
            const [ativo, preco, nota, saldo] = l.split(",");
            if (ativo) ativos.push({ ativo, preco: +preco, nota: +nota, saldo: +saldo, totalCarteira: totalCarteiraAtual() });
        });
        atualizarInterface();
    };
    reader.readAsText(file);
}

function compartilharCarteira() {
    const dados = encodeURIComponent(JSON.stringify(ativos));
    const url = `${location.origin}${location.pathname}?carteira=${dados}`;
    QRCode.toCanvas(document.getElementById('qrCode'), url, error => {
        if (error) console.error(error);
    });
}

document.getElementById("toggleTheme").onclick = () => {
    document.body.classList.toggle("dark-mode");
};

window.onload = () => {
    const params = new URLSearchParams(location.search);
    const dados = params.get("carteira");
    if (dados) {
        try {
            ativos = JSON.parse(decodeURIComponent(dados));
        } catch {}
    }
    atualizarInterface();
};