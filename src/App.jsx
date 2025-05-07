import React, { useState, useEffect } from "react";

export default function App() {
  const [aba, setAba] = useState("inicio");
  const [dividas, setDividas] = useState([]);
  const [receber, setReceber] = useState([]);
  const [salario, setSalario] = useState("");
  const [historico, setHistorico] = useState([]);
  const [filtroMes, setFiltroMes] = useState("");

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

  useEffect(() => {
    localStorage.setItem("dividas", JSON.stringify(dividas));
  }, [dividas]);

  useEffect(() => {
    localStorage.setItem("receber", JSON.stringify(receber));
  }, [receber]);

  useEffect(() => {
    if (salario !== "") {
      const valor = parseFloat(salario.replace(",", "."));
      if (!isNaN(valor)) localStorage.setItem("salario", valor);
    }
  }, [salario]);

  useEffect(() => {
    localStorage.setItem("historico", JSON.stringify(historico));
  }, [historico]);

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

  const deletarItem = (lista, setLista, id) => {
    setLista(lista.filter(i => i.id !== id));
  };

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
        inputMode="decimal"
      />
      <div className="text-lg font-semibold">Saldo final: {formatarMoeda(saldoFinal)}</div>
      <div className="text-sm">Total Dívidas: {formatarMoeda(totalGastos)}</div>
      <div className="text-sm">Total a Receber: {formatarMoeda(totalReceber)}</div>
    </div>
  );

  const TelaDividas = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <input className="p-2 border w-full rounded" placeholder="Nome" value={formDivida.nome}
          onChange={e => setFormDivida({ ...formDivida, nome: e.target.value })} />
        <input className="p-2 border w-full rounded" placeholder="Valor" value={formDivida.valor}
          onChange={e => setFormDivida({ ...formDivida, valor: e.target.value })} inputMode="decimal" />
        <input className="p-2 border w-full rounded" type="number" placeholder="Parcelas"
          value={formDivida.parcelas} onChange={e => setFormDivida({ ...formDivida, parcelas: e.target.value })} />
        <input className="p-2 border w-full rounded" type="date"
          value={formDivida.vencimento} onChange={e => setFormDivida({ ...formDivida, vencimento: e.target.value })} />
        <input className="p-2 border w-full rounded" placeholder="Categoria"
          value={formDivida.categoria} onChange={e => setFormDivida({ ...formDivida, categoria: e.target.value })} />
        <button className="w-full bg-green-600 text-white py-2 rounded" onClick={adicionarDivida}>Adicionar</button>
      </div>
      {dividas.map(d => (
        <div key={d.id} className="p-2 border rounded bg-white space-y-1">
          <div className="font-semibold">{d.nome}</div>
          <div>Valor: {formatarMoeda(d.valor)} | Parcelas: {d.parcelas}</div>
          {d.vencimento && <div className={estaVencendo(d.vencimento) ? "text-red-600" : ""}>Vence: {formatarData(d.vencimento)}</div>}
          <div>Categoria: {d.categoria || "—"}</div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={d.pago} onChange={() =>
              setDividas(dividas.map(x => x.id === d.id ? { ...x, pago: !x.pago } : x))} /> Pago
          </label>
          <button className="text-red-600" onClick={() => deletarItem(dividas, setDividas, d.id)}>🗑️</button>
        </div>
      ))}
    </div>
  );

  const TelaReceber = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <input className="p-2 border w-full rounded" placeholder="Nome" value={formReceber.nome}
          onChange={e => setFormReceber({ ...formReceber, nome: e.target.value })} />
        <input className="p-2 border w-full rounded" placeholder="Devedor" value={formReceber.devedor}
          onChange={e => setFormReceber({ ...formReceber, devedor: e.target.value })} />
        <input className="p-2 border w-full rounded" placeholder="Valor" value={formReceber.valor}
          onChange={e => setFormReceber({ ...formReceber, valor: e.target.value })} inputMode="decimal" />
        <input className="p-2 border w-full rounded" type="number" placeholder="Parcelas" value={formReceber.parcelas}
          onChange={e => setFormReceber({ ...formReceber, parcelas: e.target.value })} />
        <input className="p-2 border w-full rounded" placeholder="Categoria"
          value={formReceber.categoria} onChange={e => setFormReceber({ ...formReceber, categoria: e.target.value })} />
        <button className="w-full bg-green-600 text-white py-2 rounded" onClick={adicionarReceber}>Adicionar</button>
      </div>
      {receber.map(r => (
        <div key={r.id} className="p-2 border rounded bg-white space-y-1">
          <div className="font-semibold">{r.nome}</div>
          <div>De: {r.devedor} | Valor: {formatarMoeda(r.valor)} | Parcelas: {r.parcelas}</div>
          <div>Categoria: {r.categoria || "—"}</div>
          <button className="text-red-600" onClick={() => deletarItem(receber, setReceber, r.id)}>🗑️</button>
        </div>
      ))}
    </div>
  );

  const TelaRelatorio = () => (
    <div className="space-y-2">
      <div className="font-semibold">Resumo do Mês</div>
      <div>Salário: {formatarMoeda(salario)}</div>
      <div>Total Dívidas: {formatarMoeda(totalGastos)}</div>
      <div>Pagos: {formatarMoeda(pagos)}</div>
      <div>Total a Receber: {formatarMoeda(totalReceber)}</div>
      <div className="font-bold">Saldo Final: {formatarMoeda(saldoFinal)}</div>
      <button className="w-full bg-green-600 text-white py-2 rounded mt-4" onClick={salvarHistoricoMensal}>
        Salvar Histórico do Mês
      </button>
    </div>
  );

  const TelaHistorico = () => (
    <div className="space-y-4">
      <input className="p-2 border w-full rounded" placeholder="Filtrar por mês (ex: 2025-05)"
        value={filtroMes} onChange={e => setFiltroMes(e.target.value)} />
      {historico.filter(h => !filtroMes || h.data.startsWith(filtroMes)).map(h => (
        <div key={h.id} className="p-3 border rounded bg-white space-y-1">
          <div className="font-bold">Mês: {h.data}</div>
          <div>Salário: {formatarMoeda(h.salario)}</div>
          <div>Dívidas: {formatarMoeda(h.dividas.reduce((s, d) => s + parseFloat(d.valor), 0))}</div>
          <div>Receber: {formatarMoeda(h.receber.reduce((s, r) => s + parseFloat(r.valor), 0))}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 p-4 text-green-900">
      <h1 className="text-2xl font-bold text-center mb-6">💰 Assistente Financeiro</h1>
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {["inicio", "dividas", "receber", "relatorio", "historico"].map(tab => (
          <button key={tab} onClick={() => setAba(tab)}
            className={`px-4 py-2 rounded-full ${aba === tab ? "bg-green-600 text-white" : "bg-white border border-green-400"}`}>
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
