import { FenixMark, IconLock, IconLogout, IconSwitch, IconUser } from "./icons";

interface Props {
  name: string;
  area: "clipador" | "equipe";
  /** mostra o botão de alternar entre área do clipador e painel da equipe (só pra quem é da equipe) */
  canSwitch?: boolean;
  onAccount?: () => void;
  demo?: boolean;
}

export function Topbar({ name, area, canSwitch, onAccount, demo }: Props) {
  const other = area === "clipador" ? { href: "/admin", label: "Painel da equipe" } : { href: "/clipador", label: "Área do clipador" };
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href={area === "clipador" ? "/clipador" : "/admin"} aria-label="Fênix Clipadores — início">
            <FenixMark />
            <span>
              Fênix <span className="brand-sep">·</span> {area === "clipador" ? "Clipadores" : "Equipe"}
            </span>
          </a>
          <nav className="topbar-actions" aria-label="Conta">
            <span className="me">
              <IconUser size={16} />
              <span className="me-name">{name}</span>
            </span>
            {canSwitch && (
              <a className="btn btn-ghost btn-sm" href={other.href} aria-label={other.label}>
                <IconSwitch size={16} />
                <span className="hide-sm">{other.label}</span>
              </a>
            )}
            {onAccount && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onAccount} aria-label="Minha conta">
                <IconLock size={16} />
                <span className="hide-sm">Minha conta</span>
              </button>
            )}
            <a className="btn btn-ghost btn-sm" href="/login" aria-label="Sair">
              <IconLogout size={16} />
              <span className="hide-sm">Sair</span>
            </a>
          </nav>
        </div>
      </header>
      {demo && (
        <div className="demo-banner" role="note">
          Modo demonstração: nomes, @ e números são fictícios. Nada do que você fizer aqui é salvo.
        </div>
      )}
    </>
  );
}
