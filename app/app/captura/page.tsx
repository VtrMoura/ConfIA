import NextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CapturaClient = NextDynamic(
  () => import("./CapturaClient"), // mesmo diretório
  {
    ssr: false,
    loading: () => <div style={{ padding: 16 }}>Carregando…</div>,
  }
);

export default function Page() {
  return <CapturaClient />;
}
