"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  name: string;
  phone: string;
  purchases: number;
  reward_available: boolean;
  puntos: number;
  puntos_acumulados: number;
  nivel: string;
};

export default function AdminPage() {
const [phone, setPhone] = useState("");
const [customer, setCustomer] = useState<Customer | null>(null);
const [purchaseAmount, setPurchaseAmount] = useState("");  
const [newCustomerName, setNewCustomerName] = useState("");
const [newCustomerPhone, setNewCustomerPhone] = useState("");
const [showNewCustomer, setShowNewCustomer] = useState(false);

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [authenticated, setAuthenticated] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setAuthenticated(true);
      setCheckingAuth(false);
    }

    checkAuth();
  }, []);
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}

  async function searchCustomer() {

    setMessage("");
    setCustomer(null);

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 9) {
      setMessage("Ingresa un número de WhatsApp válido de 9 dígitos.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("get_customer_by_phone", {
        customer_phone: cleanPhone,
      });

      if (error) {
        console.error(error);
        setMessage("No pudimos consultar al cliente.");
        return;
      }

      if (!data?.found) {
        setMessage("No encontramos un cliente con este número.");
        return;
      }

setCustomer({
  id: data.id,
  name: data.name,
  phone: data.phone,
  purchases: data.purchases ?? 0,
  reward_available: data.reward_available ?? false,
  puntos: data.puntos,
  puntos_acumulados: data.puntos_acumulados,
  nivel: data.nivel,
});
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }
async function createCustomer() {
  setMessage("");

  const cleanPhone = newCustomerPhone.replace(/\D/g, "");

  if (!newCustomerName.trim()) {
    setMessage("Ingresa el nombre del cliente.");
    return;
  }

  if (cleanPhone.length !== 9) {
    setMessage("Ingresa un número de WhatsApp válido de 9 dígitos.");
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase.rpc("create_customer", {
      customer_name: newCustomerName.trim(),
      customer_phone: cleanPhone,
    });

    if (error) {
      console.error("ERROR CREAR CLIENTE:", error);
      setMessage(`No pudimos crear el cliente: ${error.message}`);
      return;
    }

    if (!data?.success) {
      setMessage(
        data?.message || "No pudimos registrar al cliente."
      );
      return;
    }

    setCustomer({
  id: data.id,
  name: data.name,
  phone: data.phone,
  puntos: data.puntos,
  puntos_acumulados: data.puntos_acumulados,
  nivel: data.nivel,
  purchases: data.purchases ?? 0,
  reward_available: data.reward_available ?? false,
});

    setPhone(data.phone);

    setNewCustomerName("");
    setNewCustomerPhone("");
    setShowNewCustomer(false);

    setMessage("✅ Cliente registrado correctamente.");
  } catch (error) {
    console.error(error);
    setMessage("Ocurrió un error al registrar el cliente.");
  } finally {
    setLoading(false);
  }
}
  async function addPurchase() {
    if (!customer) return;
const amount = Number(purchaseAmount);

if (!purchaseAmount || amount <= 0) {
  setMessage("Ingresa un monto de compra válido.");
  return;
}
    setLoading(true);
    setMessage("");

    try {
      const amount = Number(purchaseAmount);

if (!amount || amount <= 0) {
  setMessage("Ingresa un monto de compra válido.");
  return;
}

const { data, error } = await supabase.rpc("add_purchase", {
  customer_id: customer.id,
  purchase_amount: amount,
});

      if (error) {
        console.error(error);
        setMessage("No pudimos registrar la compra.");
        return;
      }

      if (!data?.success) {
        setMessage(data?.message || "No pudimos registrar la compra.");
        return;
      }

      setCustomer({
  ...customer,
  puntos: data.puntos,
  puntos_acumulados: data.puntos_acumulados,
  nivel: data.nivel,
});

      setPurchaseAmount("");
      
      setMessage("✅ Compra registrada correctamente.");
      setPurchaseAmount("");
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error al registrar la compra.");
    } finally {
      setLoading(false);
    }
  }

  async function redeemReward() {
    if (!customer) return;

    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.rpc("redeem_reward", {
        customer_id: customer.id,
      });

if (error) {
  console.error("ERROR CANJE:", error);
  setMessage(
    `Error al canjear: ${error.message || JSON.stringify(error)}`
  );
  return;
}

      if (!data?.success) {
        setMessage(data?.message || "No hay una recompensa disponible.");
        return;
      }

      setCustomer({
        ...customer,
        purchases: data.purchases,
        reward_available: data.reward_available,
      });

      setMessage("🎁 Recompensa canjeada correctamente.");
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error al procesar el canje.");
    } finally {
      setLoading(false);
    }
  }

  const progress = customer
    ? Math.min((customer.purchases / 10) * 100, 100)
    : 0;

  if (checkingAuth || !authenticated) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <p className="text-[#5b2630] font-semibold">
          Verificando acceso...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#3b2418]">
      {/* HEADER */}
      <header className="border-b border-[#eadfd5] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              UMAMI
            </h1>
            <p className="text-xs tracking-[0.25em] text-[#9a6b58]">
              REWARDS
            </p>
          </div>

          <button
  onClick={logout}
  className="rounded-full border border-[#5b2630] px-5 py-2 text-sm font-semibold text-[#5b2630] hover:bg-[#5b2630] hover:text-white"
>
  Salir
</button>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <span className="inline-block rounded-full bg-[#ead8cf] px-4 py-2 text-xs font-medium tracking-wide text-[#5b2630]">
            PANEL DE UMAMI
          </span>

          <h2 className="mt-5 text-4xl font-bold">
            Gestionar clientes
          </h2>

          <p className="mt-3 text-[#70594d]">
            Busca un cliente por su número de WhatsApp para registrar
            compras y gestionar recompensas.
          </p>
        </div>

        {/* SEARCH */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfd5]">
          <label className="text-sm font-semibold">
            WhatsApp del cliente
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchCustomer();
                }
              }}
              placeholder="Ej. 948910538"
              className="flex-1 rounded-xl border border-[#d8c8bd] bg-[#faf7f2] px-4 py-3 outline-none focus:border-[#5b2630]"
            />

            <button
              onClick={searchCustomer}
              disabled={loading}
              className="rounded-xl bg-[#5b2630] px-7 py-3 font-semibold text-white hover:bg-[#472029] disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Buscar cliente"}
            </button>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mt-5 rounded-xl border border-[#eadfd5] bg-white px-5 py-4 text-sm">
            {message}
          </div>
        )}

        {/* CUSTOMER */}
        {customer && (
          <div className="mt-8 overflow-hidden rounded-3xl bg-[#5b2630] text-white shadow-lg">
            <div className="p-7">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#e8c88e]">
                    Cliente
                  </p>

                  <h3 className="mt-2 text-3xl font-bold">
                    {customer.name}
                  </h3>

                  <p className="mt-2 text-[#ead8cf]">
                    WhatsApp: {customer.phone}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-5 py-4 text-center">
                  <p className="text-xs text-[#ead8cf]">
                    Progreso
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {customer.puntos} pts
                  </p>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="mt-8">
                <div className="h-4 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-[#e8c88e] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-sm text-[#ead8cf]">
                  <span>
                    {customer.purchases >= 10
                      ? "🎉 Recompensa disponible"
                      : `Faltan ${10 - customer.purchases} compras`}
                  </span>

                  <span>{Math.round(progress)}%</span>
                </div>
              </div>

              {/* ACTIONS */}

<div className="mt-8">
  <label className="mb-2 block text-sm font-semibold text-[#ead8cf]">
    Monto de la compra
  </label>

  <div className="flex flex-col gap-3 sm:flex-row">
    <input
      type="number"
      min="0"
      step="0.01"
      value={purchaseAmount}
      onChange={(e) => setPurchaseAmount(e.target.value)}
      placeholder="Ej. 25.90"
      className="flex-1 rounded-xl border border-white/20 bg-white px-4 py-4 text-[#3b2418] outline-none focus:border-[#e8c88e]"
    />

    <button
      onClick={addPurchase}
      disabled={loading || customer.purchases >= 10}
      className="rounded-xl bg-[#e8c88e] px-6 py-4 font-bold text-[#3b2418] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? "Procesando..." : "+ Registrar compra"}
    </button>
  </div>

  <button
    onClick={redeemReward}
    disabled={loading || !customer.reward_available}
    className="mt-4 w-full rounded-xl border border-white/40 px-6 py-4 font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
  >
    🎁 Canjear recompensa
  </button>
</div>
      </div>

      {/* REWARD */}
      {customer.reward_available && (
        <div className="border-t border-white/10 bg-white/10 p-6">
          <p className="text-sm text-[#ead8cf]">
            RECOMPENSA DISPONIBLE
          </p>

          <p className="mt-1 text-xl font-bold">
            1 postre gratis
          </p>
        </div>
      )}
    </div>
  )}
</section>

{/* FOOTER */}
<footer className="mt-20 bg-[#3b2418] px-6 py-8 text-center text-white">
  <p className="font-bold">Umami Foods & Co.</p>

  <p className="mt-1 text-sm text-[#ead8cf]">
    Panel administrativo · Umami Rewards
  </p>
</footer>

</main>
);
}
