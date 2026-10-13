"use client";

import { PAYOUT_BUSINESS_DAY, REMOVALS_PER_WARNING, SUSPENSION_MONTHS, WARNING_WINDOW_MONTHS, WARNINGS_LIMIT } from "@/lib/clipador/rules";
import { IconBook } from "./icons";
import { Modal } from "./Modal";

/**
 * Termos de participação do time de clipadores.
 * TEXTO-BASE: revisar com o jurídico da Fênix antes de pôr no ar.
 */
export function TermsModal({ onClose, onAccept }: { onClose: () => void; onAccept?: () => void }) {
  return (
    <Modal
      title="Termos de participação"
      icon={<IconBook />}
      onClose={onClose}
      wide
      footer={
        onAccept ? (
          <>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Fechar
            </button>
            <button type="button" className="btn btn-primary" onClick={onAccept}>
              Li e aceito
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Fechar
          </button>
        )
      }
    >
      <div className="terms">
        <p className="muted">Ao criar a conta e enviar clipes, você concorda com estes termos.</p>
        <h3>1. Quem pode participar</h3>
        <p>Qualquer pessoa com conta ativa no TikTok, Instagram ou YouTube. Menores de 18 anos só participam com autorização do responsável, que também passa a responder por estes termos.</p>
        <h3>2. O que você posta</h3>
        <p>
          Você é responsável por tudo o que publica nos seus perfis. Os clipes precisam ter a Fênix ou a equipe Fênix como assunto principal, ser postados no mês da
          competição e em contas cadastradas e confirmadas por você.
        </p>
        <h3>3. Conduta</h3>
        <p>
          É proibido: prometer aprovação garantida, inventar vagas, salários ou datas, falar mal de outros cursos ou professores, cortar falas mudando o sentido, usar
          música ou imagem de terceiros sem permissão, e divulgar aposta, jogo de azar, conteúdo ilegal ou concorrentes da Fênix no mesmo perfil.
        </p>
        <h3>4. Fraude</h3>
        <p>
          Views compradas, uso de bots, envio de clipe de outra pessoa ou de conteúdo sem relação com a Fênix levam à remoção dos clipes e podem levar ao banimento, sem
          direito a prêmio.
        </p>
        <h3>5. Remoções e advertências</h3>
        <p>
          A equipe pode remover clipes que não sigam as regras. A cada {REMOVALS_PER_WARNING} clipes removidos, você recebe 1 advertência. {WARNINGS_LIMIT} advertências
          em {WARNING_WINDOW_MONTHS} meses deixam você {SUSPENSION_MONTHS} meses fora da competição.
        </p>
        <h3>6. Prêmios</h3>
        <p>
          Os premiados são definidos pela soma das views dos clipes válidos no mês, conferidas pelas plataformas oficiais. O prêmio é pago via Pix até o{" "}
          {PAYOUT_BUSINESS_DAY}º dia útil do mês seguinte, na chave cadastrada no seu nome. Chave errada ou de outra pessoa é responsabilidade de quem cadastrou.
        </p>
        <h3>7. Uso dos clipes</h3>
        <p>Ao enviar um clipe, você autoriza a Fênix a repostar e reutilizar o conteúdo nos canais e materiais da marca, sem custo e sem prazo.</p>
        <h3>8. Seus dados</h3>
        <p>
          Usamos seu nome, contato, perfis e chave Pix só pra competição e pagamento. A chave Pix fica visível só pra você e pra equipe. O seu nome, os seus clipes e
          as suas views aparecem pros outros clipadores no ranking.
        </p>
        <h3>9. Mudanças</h3>
        <p>A Fênix pode mudar regras e prêmios avisando com antecedência nesta área. Mudanças não valem pra meses já fechados.</p>
      </div>
    </Modal>
  );
}
