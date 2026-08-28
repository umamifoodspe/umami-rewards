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

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleContinue() {
    setMessage("");

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 9) {
      setMessage("Ingresa un número de WhatsApp válido de 9 dígitos.");
      return;
    }

    setLoading(true);

    try {
      // BUSCAR CLIENTE
      const { data, error } = await supabase.rpc("get_customer_by_phone", {
        customer_phone: cleanPhone,
      });

      if (error) {
        console.error(error);
        setMessage("No pudimos consultar tus datos. Intenta nuevamente.");
        return;
      }

      // CLIENTE EXISTE
      if (data?.found === true) {
        setCustomer({
          id: data.id,
          name: data.name,
          phone: data.phone,
          purchases: data.purchases,
          reward_available: data.reward_available,
        });

        setShowLogin(false);
        setPhone("");
        setName("");
        setIsRegistering(false);

        return;
      }

      // CLIENTE NO EXISTE
      setIsRegistering(true);
      setMessage("No encontramos una cuenta con este número. Regístrate para comenzar.");
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setMessage("");

    if (!name.trim()) {
      setMessage("Ingresa tu nombre.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("register_customer", {
        customer_name: name.trim(),
        customer_phone: cleanPhone,
      });

      if (error) {
        console.error(error);
        setMessage("No pudimos crear tu cuenta. Intenta nuevamente.");
        return;
      }

      setCustomer({
        id: data.id,
        name: data.name,
        phone: data.phone,
        purchases: data.purchases,
        reward_available: data.reward_available,
      });

      setShowLogin(false);
      setPhone("");
      setName("");
      setIsRegistering(false);
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error al registrarte.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem() {
    if (!customer) return;

    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.rpc("redeem_reward", {
        customer_id: customer.id,
      });

      if (error) {
        console.error(error);
        setMessage("No pudimos procesar el canje.");
        return;
      }

      if (data?.success !== true) {
        setMessage(data?.message || "No hay una recompensa disponible.");
        return;
      }

      setCustomer({
        id: data.id,
        name: data.name,
        phone: data.phone,
        purchases: data.purchases,
        reward_available: data.reward_available,
      });

      setMessage("🎉 ¡Recompensa canjeada correctamente!");
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error al procesar el canje.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setCustomer(null);
    setMessage("");
  }

  const progress = customer ? (customer.purchases / 10) * 100 : 0;

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#3b2418]">
      {/* HEADER */}
      <header className="border-b border-[#eadfd5] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              UMAMI
            </h1>

            <p className="text-xs tracking-[0.25em] text-[#9a6b52]">
              REWARDS
            </p>
          </div>

          {customer ? (
            <button
              onClick={handleLogout}
              className="rounded-full border border-[#5b2630] px-5 py-2.5 text-sm font-semibold text-[#5b2630] transition hover:bg-[#f1e7e2]"
            >
              Salir
            </button>
          ) : (
            <button
              onClick={() => {
                setShowLogin(true);
                setMessage("");
                setIsRegistering(false);
              }}
              className="rounded-full bg-[#5b2630] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#431c24]"
            >
              Ingresar
            </button>
          )}
        </div>
      </header>

      {/* CLIENT DASHBOARD */}
      {customer ? (
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#ead8cf] px-4 py-2 text-sm font-medium text-[#5b2630]">
                UMAMI REWARDS
              </span>

              <h2 className="mt-6 text-4xl font-bold md:text-5xl">
                ¡Hola, {customer.name}!
              </h2>

              <p className="mt-4 text-lg text-[#70594d]">
                Este es tu progreso en Umami Rewards.
              </p>
            </div>

            {/* PROGRESS CARD */}
            <div className="mt-12 rounded-3xl bg-[#5b2630] p-8 text-white shadow-xl md:p-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[#e9cfc2]">
                    Tu progreso
                  </p>

                  <p className="mt-3 text-4xl font-bold">
                    {customer.purchases} / 10
                  </p>
                </div>

                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#e9c08f] text-xl font-bold">
                  {customer.purchases * 10}%
                </div>
              </div>

              <div className="mt-8 h-4 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#e9c08f] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-4 text-[#ead8cf]">
                {customer.reward_available
                  ? "🎉 ¡Has desbloqueado una recompensa!"
                  : `Te faltan ${10 - customer.purchases} compras para tu recompensa.`}
              </p>

              {/* REWARD */}
              <div className="mt-8 rounded-2xl bg-white/10 p-6">
                <p className="text-sm text-[#ead8cf]">
                  Próxima recompensa
                </p>

                <p className="mt-2 text-2xl font-bold">
                  1 postre gratis
                </p>

                {customer.reward_available && (
                  <button
                    onClick={handleRedeem}
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-[#e9c08f] py-3.5 font-bold text-[#5b2630] transition hover:bg-[#f2d2a8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Procesando..." : "Canjear recompensa"}
                  </button>
                )}
              </div>
            </div>

            {message && (
              <div className="mt-6 rounded-2xl border border-[#eadfd5] bg-white p-4 text-center text-sm">
                {message}
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* HERO */}
          <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <span className="inline-block rounded-full bg-[#ead8cf] px-4 py-2 text-sm font-medium text-[#5b2630]">
                  Tu sabor tiene recompensa
                </span>

                <h2 className="mt-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                  Cada compra te acerca a algo delicioso.
                </h2>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[#70594d]">
                  Bienvenido a Umami Rewards, el programa de fidelización de
                  Umami Foods & Co. Acumula compras, desbloquea recompensas y
                  disfruta aún más de tus favoritos.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setIsRegistering(false);
                    }}
                    className="rounded-full bg-[#5b2630] px-7 py-3.5 font-semibold text-white transition hover:bg-[#431c24]"
                  >
                    Quiero ser parte
                  </button>

                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setIsRegistering(false);
                    }}
                    className="rounded-full border border-[#5b2630] px-7 py-3.5 font-semibold text-[#5b2630] transition hover:bg-[#f1e7e2]"
                  >
                    Ya soy cliente
                  </button>
                </div>
              </div>

              {/* REWARD CARD */}
              <div>
                <div className="rounded-3xl bg-[#5b2630] p-8 text-white shadow-xl">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#e9cfc2]">
                    UMAMI REWARDS
                  </p>

                  <h3 className="mt-8 text-3xl font-bold">
                    Tu próxima recompensa
                  </h3>

                  <p className="mt-3 text-[#ead8cf]">
                    Completa tus compras y consigue un premio.
                  </p>

                  <div className="mt-8">
                    <div className="mb-3 flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>0 / 10 compras</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-0 rounded-full bg-[#e9c08f]" />
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl bg-white/10 p-5">
                    <p className="text-sm text-[#ead8cf]">
                      Recompensa
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      1 postre gratis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="border-y border-[#eadfd5] bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a6b52]">
                  ¿Cómo funciona?
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Simple, rápido y delicioso.
                </h2>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                <Step
                  number="01"
                  title="Regístrate"
                  text="Crea tu cuenta con tus datos básicos y comienza a formar parte de Umami Rewards."
                />

                <Step
                  number="02"
                  title="Compra"
                  text="Cada compra registrada suma para acercarte a tu siguiente recompensa."
                />

                <Step
                  number="03"
                  title="Disfruta"
                  text="Al completar tu progreso, desbloquea tu recompensa y vuelve a comenzar."
                />
              </div>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer className="bg-[#3b2418] px-6 py-10 text-center text-white">
        <p className="font-semibold">
          Umami Foods & Co.
        </p>

        <p className="mt-2 text-sm text-[#d9c5ba]">
          Tu sabor tiene recompensa.
        </p>
      </footer>

      {/* LOGIN / REGISTER MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a6b52]">
                  UMAMI REWARDS
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {isRegistering ? "Crea tu cuenta" : "Bienvenido"}
                </h2>
              </div>

              <button
                onClick={() => {
                  setShowLogin(false);
                  setMessage("");
                  setIsRegistering(false);
                }}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {isRegistering && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nombre
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full rounded-xl border border-[#dfd2ca] px-4 py-3 outline-none focus:border-[#5b2630]"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  WhatsApp
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="999 999 999"
                  maxLength={11}
                  className="w-full rounded-xl border border-[#dfd2ca] px-4 py-3 outline-none focus:border-[#5b2630]"
                />
              </div>

              {message && (
                <div className="rounded-xl bg-[#faf7f2] p-3 text-sm text-[#5b2630]">
                  {message}
                </div>
              )}

              <button
                onClick={isRegistering ? handleRegister : handleContinue}
                disabled={loading}
                className="w-full rounded-xl bg-[#5b2630] py-3.5 font-semibold text-white transition hover:bg-[#431c24] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Procesando..."
                  : isRegistering
                  ? "Crear mi cuenta"
                  : "Continuar"}
              </button>

              {isRegistering && (
                <button
                  onClick={() => {
                    setIsRegistering(false);
                    setMessage("");
                  }}
                  className="w-full text-sm font-medium text-[#5b2630]"
                >
                  ← Volver
                </button>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Tus datos serán utilizados para gestionar tu programa de
              fidelización Umami Rewards.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-[#eadfd5] bg-[#faf7f2] p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5b2630] text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-[#70594d]">
        {text}
      </p>
    </div>
  );
}