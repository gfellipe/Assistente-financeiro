import React, { useState, useEffect } from "react";

export default function App() {
  const [aba, setAba] = useState("inicio");
  const [dividas, setDividas] = useState([]);
  const [receber, setReceber] = useState([]);
  const [salario, setSalario] = useState("");
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const d = localStorage.getItem("dividas");
    const r = localStorage.getItem("receber");
    const s = localStorage.getItem("salario");
    const h = localStorage.getItem("historico");
    if (d) setDividas(JSON.parse(d));
    if (r) setReceber(JSON.parse(r));
    if (s) setSalario(s.toString());
    if (h) setHistorico(JSON.parse(h));
  }, []);

  useEffect(() => localStorage.setItem("dividas", JSON.stringify(dividas)), [dividas]);
  useEffect(() => localStorage.setItem("receber", JSON.stringify(receber)), [receber]);
  useEffect(() => {
    const valor = parseFloat(salario.replace(",", "."));
    if (!isNaN(valor)) localStorage.setItem("salario", valor);
  }, [salario]);
  useEffect(() => localStorage.setItem("historico", JSON.stringify(historico)), [historico]);

  const [formDivida, setFormDivida] = useState({
    nome: "", valor: "", parcelas: "1", vencimento: "", pago: false, categoria: ""
  });
  const [formReceber, setFormReceber] = useState({
    devedor: "", nome: "", valor: "", parcelas: "1", categoria: ""
  });

  const adicionarDivida = () => {
    if (!formDivida.nome || !formDivida.valor) return;
    const nova = { ...formDivida, id: Date.now() };
    setDividas([...dividas, nova]);
    setFormDivida({ nome: "", valor: "", parcelas: "1", vencimento: "", pago: false, categoria: "" });
  };

  const adicionarReceber = () => {
    if (!formReceber.nome || !formReceber.valor || !formReceber.devedor) return;
    const nova = { ...formReceber, id: Date.now() };
    setReceber([...receber, nova]);
    setFormReceber({ devedor: "", nome: "", valor: "", parcelas: "1", categoria: "" });
  };

  const deletarItem = (lista, setLista, id) => setLista(lista.filter(i => i.id !== id));

  const salvarHistoricoMensal = () => {
    const snapshot = {
      id: Date.now(),
      data: new Date().toISOString().slice(0, 7),
      salario: parseFloat(salario.replace(",", ".")),
      dividas,
      receber
    };
    setHistorico([...historico, snapshot]);
  };

  const totalGastos = dividas.reduce((s, d) => s + parseFloat(d.valor || 0), 0);
  const totalReceber = receber.reduce((s, r) => s + parseFloat(r.valor || 0), 0);
  const pagos = dividas.filter(d => d.pago).reduce((s, d) => s + parseFloat(d.valor || 0), 0);
  const saldoFinal = parseFloat(salario.replace(",", ".")) - totalGastos + totalReceber;

  const formatarMoeda = v => parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarData = v => { const [a, m, d] = v.split('-'); return `${d}-${m}-${a}`; };
  const estaVencendo = v => {
    const hj = new Date();
    const dt = new Date(v);
    const dif = (dt - hj) / 86400000;
    return dif >= 0 && dif <= 3;
  };

  const TelaInicio = () => (
    <div className="text-center space-y-4">
      <input
        className="p-2 border w-full max-w-xs rounded text-center"
        placeholder="Salário do mês"
        value={salario}
        onChange={e => setSalario(e.target.value)}
      />
      <div className="text-lg font-semibold">Saldo final: {formatarMoeda(saldoFinal)}</div>
      <div className="text-sm">Total Dívidas: {formatarMoeda(totalGastos)}</div>
      <div className="text-sm">Total a Receber: {formatarMoeda(totalReceber)}</div>
    </div>
  );

  const TelaDividas = () => {
    const totalPagas = dividas.filter(d => d.pago).length;
    const totalNaoPagas = dividas.filter(d => !d.pago).length;

    return (
      <div className="space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          <input className="p-2 border rounded" placeholder="Nome" value={formDivida.nome} onChange={e => setFormDivida({ ...formDivida, nome: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Valor" value={formDivida.valor} onChange={e => setFormDivida({ ...formDivida, valor: e.target.value })} />
          <select className="p-2 border rounded" value={formDivida.parcelas} onChange={e => setFormDivida({ ...formDivida, parcelas: e.target.value })}>
            {[...Array(12)].map((_, i) => <option key={i + 1}>{i + 1}</option>)}
          </select>
          <input type="date" className="p-2 border rounded" value={formDivida.vencimento} onChange={e => setFormDivida({ ...formDivida, vencimento: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Categoria" value={formDivida.categoria} onChange={e => setFormDivida({ ...formDivida, categoria: e.target.value })} />
          <button onClick={adicionarDivida} className="bg-green-600 text-white px-4 py-2 rounded col-span-full">Adicionar</button>
        </div>
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="bg-green-200">
              <th>Nome</th><th>Valor</th><th>Parcelas</th><th>Vencimento</th><th>Pago</th><th>Categoria</th><th></th>
            </tr>
          </thead>
          <tbody>
            {dividas.map(d => (
              <tr key={d.id} className={`bg-green-50 ${estaVencendo(d.vencimento) ? "text-red-500" : ""}`}>
                <td>{d.nome}</td>
                <td>{formatarMoeda(d.valor)}</td>
                <td>{d.parcelas}</td>
                <td>{d.vencimento ? formatarData(d.vencimento) : ""}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={d.pago}
                    onChange={() => setDividas(dividas.map(item => item.id === d.id ? { ...item, pago: !item.pago } : item))}
                  />
                </td>
                <td>{d.categoria}</td>
                <td><button onClick={() => deletarItem(dividas, setDividas, d.id)} className="text-red-500">Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center">
          <div className="font-semibold">Resumo de Pagamentos</div>
          <div>Dívidas Pagas: {totalPagas}</div>
          <div>Dívidas Não Pagas: {totalNaoPagas}</div>
        </div>
      </div>
    );
  };

  const TelaReceber = () => (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-3">
        <input className="p-2 border rounded" placeholder="Nome do devedor" value={formReceber.devedor} onChange={e => setFormReceber({ ...formReceber, devedor: e.target.value })} />
        <input className="p-2 border rounded" placeholder="Descrição" value={formReceber.nome} onChange={e => setFormReceber({ ...formReceber, nome: e.target.value })} />
        <input className="p-2 border rounded" placeholder="Valor" value={formReceber.valor} onChange={e => setFormReceber({ ...formReceber, valor: e.target.value })} />
        <select className="p-2 border rounded" value={formReceber.parcelas} onChange={e => setFormReceber({ ...formReceber, parcelas: e.target.value })}>
          {[...Array(12)].map((_, i) => <option key={i + 1}>{i + 1}</option>)}
        </select>
        <input className="p-2 border rounded" placeholder="Categoria" value={formReceber.categoria} onChange={e => setFormReceber({ ...formReceber, categoria: e.target.value })} />
        <button onClick={adicionarReceber} className="bg-green-600 text-white px-4 py-2 rounded col-span-full">Adicionar</button>
      </div>
      <table className="w-full text-sm text-center">
        <thead>
          <tr className="bg-green-200">
            <th>Devedor</th><th>Descrição</th><th>Valor</th><th>Parcelas</th><th>Categoria</th><th></th>
          </tr>
        </thead>
        <tbody>
          {receber.map(r => (
            <tr key={r.id} className="bg-green-50">
              <td>{r.devedor}</td>
              <td>{r.nome}</td>
              <td>{formatarMoeda(r.valor)}</td>
              <td>{r.parcelas}</td>
              <td>{r.categoria}</td>
              <td><button onClick={() => deletarItem(receber, setReceber, r.id)} className="text-red-500">Excluir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const TelaRelatorio = () => (
    <div className="text-center space-y-4">
      <div className="text-xl font-semibold">Relatório Financeiro</div>
      <div>Total Dívidas: {formatarMoeda(totalGastos)}</div>
      <div>Total Receber: {formatarMoeda(totalReceber)}</div>
      <div>Saldo Final: {formatarMoeda(saldoFinal)}</div>
      <button onClick={salvarHistoricoMensal} className="bg-green-600 text-white px-4 py-2 rounded">Salvar Histórico</button>
    </div>
  );

  const TelaHistorico = () => (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-center">Histórico Mensal</div>
      <table className="w-full text-sm text-center">
        <thead>
          <tr className="bg-green-200">
            <th>Mês</th><th>Salário</th><th>Dívidas</th><th>A Receber</th>
          </tr>
        </thead>
        <tbody>
          {historico.map(h => (
            <tr key={h.id} className="bg-green-50">
              <td>{h.data}</td>
              <td>{formatarMoeda(h.salario)}</td>
              <td>{formatarMoeda(h.dividas.reduce((s, d) => s + parseFloat(d.valor), 0))}</td>
              <td>{formatarMoeda(h.receber.reduce((s, r) => s + parseFloat(r.valor), 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 p-4 text-green-900">
      <h1 className="text-2xl font-bold text-center mb-6">💰 Assistente Financeiro</h1>
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {["inicio", "dividas", "receber", "relatorio", "historico"].map(tab => (
          <button
            key={tab}
            onClick={() => setAba(tab)}
            className={`px-4 py-2 rounded-full ${aba === tab ? "bg-green-600 text-white" : "bg-white border border-green-400"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {aba === "inicio" && <TelaInicio />}
      {aba === "dividas" && <TelaDividas />}
      {aba === "receber" && <TelaReceber />}
      {aba === "relatorio" && <TelaRelatorio />}
      {aba === "historico" && <TelaHistorico />}
    </div>
  );
}
