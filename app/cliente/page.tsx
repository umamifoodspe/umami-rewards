"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  name: string;
  phone: string;
  purchases: number;
  reward_available: boolean;
};

export default function ClientePage() {
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
        setMessage("No pudimos consultar tu información.");
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
        purchases: data.purchases,
        reward_available: data.reward_available,
      });
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const purchases = customer?.purchases ?? 0;
  const progress = Math.min(purchases, 10) * 10;
  const remaining = Math.max(10 - purchases, 0);

  return (
    <main className="min-h-screen bg-[#f8f5f0] flex flex-col">
      <header className="bg-white border-b border-[#eadfd5]">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#24150f]">
              UMAMI
            </div>
            <div className="text-xs tracking-[0.25em] text-[#8b4a4b]">
              REWARDS
            </div>
          </div>

          <div className="text-sm text-[#765c50]">
            Programa de fidelización
          </div>
        </div>
      </header>

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12">
          <div className="text-center mb-8">
            <span className="inline-block rounded-full bg-[#ead8cd] px-4 py-2 text-xs font-medium tracking-wide text-[#6b2936]">
              MI CUENTA UMAMI
            </span>

            <h1 className="mt-5 text-4xl font-bold text-[#24150f]">
              Tus recompensas
            </h1>

            <p className="mt-3 text-[#765c50]">
              Consulta tu progreso y descubre cuánto te falta para obtener tu
              recompensa.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#eadfd5] p-6 md:p-8">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-[#24150f] mb-2"
            >
              Tu número de WhatsApp
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    searchCustomer();
                  }
                }}
                placeholder="Ej. 948910538"
                className="flex-1 rounded-xl border border-[#dcc9bc] bg-[#fcfaf7] px-4 py-3 text-[#24150f] outline-none focus:border-[#6b2936]"
              />

              <button
                onClick={searchCustomer}
                disabled={loading}
                className="rounded-xl bg-[#6b2936] px-6 py-3 font-semibold text-white transition hover:bg-[#54212b] disabled:opacity-60"
              >
                {loading ? "Consultando..." : "Consultar"}
              </button>
            </div>

            {message && (
              <div className="mt-4 rounded-xl border border-[#eadfd5] bg-[#fcfaf7] px-4 py-3 text-sm text-[#6b2936]">
                {message}
              </div>
            )}
          </div>

          {customer && (
            <div className="mt-6 overflow-hidden rounded-3xl bg-[#6b2936] text-white shadow-lg">
              <div className="p-7 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium tracking-[0.2em] text-[#f0cf91]">
                      CLIENTE UMAMI
                    </div>

                    <h2 className="mt-2 text-3xl font-bold">
                      {customer.name}
                    </h2>

                    <p className="mt-2 text-sm text-[#ead8cd]">
                      WhatsApp: {customer.phone}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-5 py-4 text-center">
                    <div className="text-xs text-[#ead8cd]">Progreso</div>
                    <div className="mt-1 text-2xl font-bold">
                      {purchases}/10
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="h-4 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-[#f0cf91] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-[#ead8cd]">
                      {customer.reward_available
                        ? "🎉 ¡Recompensa disponible!"
                        : `Te faltan ${remaining} ${
                            remaining === 1 ? "compra" : "compras"
                          }`}
                    </span>

                    <span className="font-semibold">{progress}%</span>
                  </div>
                </div>
              </div>

              {customer.reward_available && (
                <div className="border-t border-white/10 bg-black/10 px-7 py-6 md:px-8">
                  <div className="text-xs font-medium tracking-[0.15em] text-[#f0cf91]">
                    🎁 RECOMPENSA DISPONIBLE
                  </div>

                  <h3 className="mt-2 text-xl font-bold">
                    ¡Felicidades!
                  </h3>

                  <p className="mt-1 text-sm text-[#ead8cd]">
                    Has completado tus 10 compras. Acércate a Umami para
                    canjear tu recompensa.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[#3d2419] px-6 py-8 text-center text-white">
        <div className="font-semibold">Umami Foods & Co.</div>
        <div className="mt-1 text-sm text-[#ead8cd]">
          Umami Rewards · Programa de fidelización
        </div>
      </footer>
    </main>
  );
}