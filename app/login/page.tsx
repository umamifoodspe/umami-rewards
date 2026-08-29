"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-[#eadfd5] p-8">
          
          <div className="text-center mb-8">
            <div className="text-2xl font-bold tracking-tight text-[#24150f]">
              UMAMI
            </div>

            <div className="text-xs tracking-[0.3em] text-[#8b5a4b]">
              REWARDS
            </div>

            <h1 className="text-2xl font-bold text-[#24150f] mt-8">
              Acceso administrativo
            </h1>

            <p className="text-sm text-[#765c50] mt-2">
              Ingresa para gestionar clientes y recompensas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#24150f] mb-2"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@umamifoods.pe"
                required
                className="w-full rounded-xl border border-[#ddcfc5] bg-[#fcfaf7] px-4 py-3 outline-none focus:border-[#682631]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#24150f] mb-2"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-[#ddcfc5] bg-[#fcfaf7] px-4 py-3 outline-none focus:border-[#682631]"
              />
            </div>

            {message && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#682631] px-4 py-3 font-semibold text-white transition hover:bg-[#54202a] disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="text-center mt-8">
            <Link href="/">
              href="/"
              className="text-sm text-[#765c50] hover:text-[#682631]"
            >
              ← Volver a Umami Rewards
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}