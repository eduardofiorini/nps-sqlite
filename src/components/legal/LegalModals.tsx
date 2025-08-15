import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Shield, FileText, Scale } from 'lucide-react';

interface LegalModalsProps {
  privacyOpen: boolean;
  termsOpen: boolean;
  lgpdOpen: boolean;
  onClosePrivacy: () => void;
  onCloseTerms: () => void;
  onCloseLgpd: () => void;
}

const LegalModals: React.FC<LegalModalsProps> = ({
  privacyOpen,
  termsOpen,
  lgpdOpen,
  onClosePrivacy,
  onCloseTerms,
  onCloseLgpd
}) => {
  return (
    <>
      {/* Privacy Policy Modal */}
      <Modal
        isOpen={privacyOpen}
        onClose={onClosePrivacy}
        title="Política de Privacidade"
        size="xl"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={onClosePrivacy}>
              Fechar
            </Button>
          </div>
        }
      >
        <div className="space-y-6 max-h-96 overflow-y-auto">
          <div className="flex items-center mb-4">
            <Shield size={20} className="text-[#00ac75] mr-2" />
            <span className="text-sm text-gray-500">Última atualização: Janeiro de 2025</span>
          </div>
          
          <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">1. Informações que Coletamos</h3>
              <div className="space-y-2">
                <p><strong>Dados Pessoais:</strong> Nome, e-mail, telefone, empresa, cargo e outras informações fornecidas voluntariamente.</p>
                <p><strong>Dados de Uso:</strong> Informações sobre como você usa nossa plataforma, incluindo páginas visitadas, recursos utilizados e tempo de sessão.</p>
                <p><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional e identificadores de dispositivo.</p>
                <p><strong>Dados de Campanhas:</strong> Respostas NPS, feedback de clientes e configurações de campanhas.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">2. Como Usamos suas Informações</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Fornecer e melhorar nossos serviços de gestão de NPS</li>
                <li>Processar pagamentos e gerenciar sua conta</li>
                <li>Enviar comunicações importantes sobre o serviço</li>
                <li>Personalizar sua experiência na plataforma</li>
                <li>Analisar uso para melhorias e desenvolvimento de novos recursos</li>
                <li>Cumprir obrigações legais e regulamentares</li>
                <li>Prevenir fraudes e garantir a segurança da plataforma</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">3. Compartilhamento de Dados</h3>
              <p className="mb-2">Não vendemos, alugamos ou comercializamos seus dados pessoais. Compartilhamos informações apenas nas seguintes situações:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Provedores de Serviços:</strong> Empresas que nos ajudam a operar a plataforma (hospedagem, pagamentos, suporte)</li>
                <li><strong>Obrigações Legais:</strong> Quando exigido por lei, ordem judicial ou autoridades competentes</li>
                <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos, propriedade ou segurança</li>
                <li><strong>Consentimento:</strong> Com sua autorização explícita para finalidades específicas</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">4. Segurança dos Dados</h3>
              <p className="mb-2">Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controles de acesso rigorosos e autenticação multifator</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares e planos de recuperação</li>
                <li>Auditorias de segurança periódicas</li>
                <li>Treinamento regular da equipe em segurança da informação</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">5. Seus Direitos</h3>
              <p className="mb-2">Você tem os seguintes direitos sobre seus dados pessoais:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Acesso:</strong> Solicitar cópia dos dados que temos sobre você</li>
                <li><strong>Retificação:</strong> Corrigir dados incorretos ou incompletos</li>
                <li><strong>Exclusão:</strong> Solicitar a remoção de seus dados pessoais</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
                <li><strong>Limitação:</strong> Restringir o processamento em certas circunstâncias</li>
                <li><strong>Retirada de Consentimento:</strong> Retirar consentimento a qualquer momento</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">6. Retenção de Dados</h3>
              <p>Mantemos seus dados pelo tempo necessário para:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Fornecer nossos serviços enquanto sua conta estiver ativa</li>
                <li>Cumprir obrigações legais e regulamentares (até 5 anos)</li>
                <li>Resolver disputas e fazer cumprir nossos acordos</li>
                <li>Fins de auditoria e conformidade</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">7. Cookies e Tecnologias Similares</h3>
              <p className="mb-2">Utilizamos cookies e tecnologias similares para:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento da plataforma</li>
                <li><strong>Cookies de Preferências:</strong> Lembrar suas configurações e preferências</li>
                <li><strong>Cookies de Análise:</strong> Entender como você usa nossa plataforma</li>
                <li><strong>Cookies de Marketing:</strong> Personalizar anúncios e conteúdo (apenas com consentimento)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">8. Transferências Internacionais</h3>
              <p>Seus dados podem ser processados em servidores localizados no Brasil e em outros países. Garantimos que todas as transferências atendem aos requisitos de proteção de dados aplicáveis.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">9. Contato</h3>
              <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política:</p>
              <div className="mt-2 space-y-1">
                <p><strong>E-mail:</strong> privacidade@meunps.com</p>
                <p><strong>Telefone:</strong> (11) 99999-9999</p>
                <p><strong>Endereço:</strong> Rua das Empresas, 123 - São Paulo, SP</p>
                <p><strong>DPO:</strong> dpo@meunps.com</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Terms of Use Modal */}
      <Modal
        isOpen={termsOpen}
        onClose={onCloseTerms}
        title="Termos de Uso"
        size="xl"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={onCloseTerms}>
              Fechar
            </Button>
          </div>
        }
      >
        <div className="space-y-6 max-h-96 overflow-y-auto">
          <div className="flex items-center mb-4">
            <FileText size={20} className="text-[#00ac75] mr-2" />
            <span className="text-sm text-gray-500">Última atualização: Janeiro de 2025</span>
          </div>
          
          <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">1. Aceitação dos Termos</h3>
              <p>
                Ao acessar e usar a plataforma Meu NPS, você concorda em cumprir e estar vinculado a estes 
                Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">2. Descrição do Serviço</h3>
              <p>
                O Meu NPS é uma plataforma Software as a Service (SaaS) para gestão de Net Promoter Score (NPS) 
                que permite criar campanhas, coletar feedback de clientes, analisar dados e gerar relatórios 
                para melhorar a experiência do cliente e impulsionar o crescimento do negócio.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">3. Conta de Usuário</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Você deve fornecer informações precisas e atualizadas durante o registro</li>
                <li>É responsável por manter a confidencialidade de suas credenciais de acesso</li>
                <li>Deve notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
                <li>É responsável por todas as atividades que ocorrem em sua conta</li>
                <li>Deve ter pelo menos 18 anos ou autorização legal para usar nossos serviços</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">4. Uso Aceitável</h3>
              <p className="mb-2">Você concorda em usar a plataforma apenas para fins legítimos e comerciais. É proibido:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Violar direitos de terceiros ou leis aplicáveis</li>
                <li>Enviar spam, malware ou conteúdo malicioso</li>
                <li>Tentar acessar sistemas ou dados não autorizados</li>
                <li>Interferir no funcionamento da plataforma</li>
                <li>Usar a plataforma para atividades ilegais ou fraudulentas</li>
                <li>Exceder os limites de uso do seu plano contratado</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">5. Planos e Pagamentos</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Os preços estão sujeitos a alterações mediante aviso prévio de 30 dias</li>
                <li>Pagamentos são processados mensalmente ou anualmente conforme o plano escolhido</li>
                <li>Reembolsos são concedidos conforme nossa política de reembolso</li>
                <li>O não pagamento pode resultar na suspensão ou cancelamento da conta</li>
                <li>Taxas aplicáveis podem ser adicionadas conforme a legislação local</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">6. Propriedade Intelectual</h3>
              <p className="mb-2">
                Todos os direitos de propriedade intelectual da plataforma Meu NPS, incluindo software, 
                design, textos, gráficos e marcas, pertencem a nós ou nossos licenciadores.
              </p>
              <p>
                Você mantém os direitos sobre os dados que inserir na plataforma, mas nos concede 
                licença limitada para processá-los conforme necessário para fornecer nossos serviços.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">7. Disponibilidade do Serviço</h3>
              <p className="mb-2">Nos esforçamos para manter a plataforma disponível 24/7, mas não garantimos:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Disponibilidade ininterrupta do serviço</li>
                <li>Ausência de erros ou falhas técnicas</li>
                <li>Compatibilidade com todos os dispositivos ou navegadores</li>
              </ul>
              <p className="mt-2">Realizamos manutenções programadas com aviso prévio sempre que possível.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">8. Limitação de Responsabilidade</h3>
              <p className="mb-2">
                Nossa responsabilidade é limitada ao valor pago pelos serviços nos últimos 12 meses. 
                Não nos responsabilizamos por:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Danos indiretos, incidentais ou consequenciais</li>
                <li>Lucros cessantes ou perda de oportunidades de negócio</li>
                <li>Perda de dados (mantemos backups, mas recomendamos backups próprios)</li>
                <li>Interrupções causadas por terceiros ou força maior</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">9. Cancelamento</h3>
              <p className="mb-2">Você pode cancelar sua conta a qualquer momento:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>O cancelamento pode ser feito através das configurações da conta</li>
                <li>Seus dados serão mantidos por 30 dias após o cancelamento</li>
                <li>Após 30 dias, os dados serão permanentemente excluídos</li>
                <li>Podemos cancelar contas que violem estes termos</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">10. Modificações</h3>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                Notificaremos sobre mudanças significativas por e-mail ou através da plataforma. 
                O uso continuado após as modificações constitui aceitação dos novos termos.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">11. Lei Aplicável</h3>
              <p>
                Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida 
                nos tribunais competentes de São Paulo, SP, Brasil.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">12. Contato</h3>
              <p>Para questões sobre estes termos, entre em contato:</p>
              <div className="mt-2 space-y-1">
                <p><strong>E-mail:</strong> legal@meunps.com</p>
                <p><strong>Telefone:</strong> (11) 99999-9999</p>
                <p><strong>Endereço:</strong> Rua das Empresas, 123 - São Paulo, SP - CEP 01234-567</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* LGPD Modal */}
      <Modal
        isOpen={lgpdOpen}
        onClose={onCloseLgpd}
        title="Conformidade com LGPD"
        size="xl"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={onCloseLgpd}>
              Fechar
            </Button>
          </div>
        }
      >
        <div className="space-y-6 max-h-96 overflow-y-auto">
          <div className="flex items-center mb-4">
            <Scale size={20} className="text-[#00ac75] mr-2" />
            <span className="text-sm text-gray-500">Lei Geral de Proteção de Dados - Lei nº 13.709/2018</span>
          </div>
          
          <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Nosso Compromisso com a LGPD</h3>
              <p className="text-blue-800 dark:text-blue-200">
                O Meu NPS está totalmente comprometido com a conformidade à Lei Geral de Proteção de Dados (LGPD) 
                e implementa todas as medidas necessárias para garantir a proteção dos dados pessoais.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">1. Base Legal para Tratamento</h3>
              <p className="mb-2">Tratamos seus dados pessoais com base nas seguintes hipóteses legais:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Consentimento:</strong> Para envio de comunicações de marketing</li>
                <li><strong>Execução de Contrato:</strong> Para fornecer nossos serviços</li>
                <li><strong>Interesse Legítimo:</strong> Para melhorias da plataforma e segurança</li>
                <li><strong>Cumprimento de Obrigação Legal:</strong> Para atender exigências regulamentares</li>
                <li><strong>Proteção da Vida:</strong> Em situações de emergência</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">2. Direitos dos Titulares</h3>
              <p className="mb-2">Conforme a LGPD, você tem direito a:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>Confirmação da existência de tratamento</li>
                  <li>Acesso aos dados</li>
                  <li>Correção de dados incompletos ou inexatos</li>
                  <li>Anonimização, bloqueio ou eliminação</li>
                  <li>Portabilidade dos dados</li>
                </ul>
                <ul className="list-disc list-inside space-y-1">
                  <li>Eliminação dos dados tratados com consentimento</li>
                  <li>Informação sobre compartilhamento</li>
                  <li>Informação sobre possibilidade de não consentir</li>
                  <li>Revogação do consentimento</li>
                  <li>Revisão de decisões automatizadas</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">3. Como Exercer seus Direitos</h3>
              <p className="mb-2">Para exercer qualquer um dos seus direitos:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Acesse as configurações da sua conta na plataforma</li>
                <li>Entre em contato conosco através dos canais oficiais</li>
                <li>Envie um e-mail para: lgpd@meunps.com</li>
                <li>Ligue para nosso atendimento: (11) 99999-9999</li>
              </ol>
              <p className="mt-2 text-xs text-gray-500">
                Responderemos sua solicitação em até 15 dias úteis, conforme estabelecido pela LGPD.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">4. Medidas de Segurança</h3>
              <p className="mb-2">Implementamos medidas técnicas e administrativas para proteger seus dados:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Criptografia:</strong> Dados criptografados em trânsito e em repouso</li>
                <li><strong>Controle de Acesso:</strong> Acesso restrito apenas a pessoal autorizado</li>
                <li><strong>Monitoramento:</strong> Sistemas de detecção de ameaças 24/7</li>
                <li><strong>Treinamento:</strong> Equipe treinada em proteção de dados</li>
                <li><strong>Auditorias:</strong> Revisões regulares de segurança e conformidade</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">5. Compartilhamento de Dados</h3>
              <p className="mb-2">Seus dados podem ser compartilhados apenas nas seguintes situações:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Com seu consentimento explícito</li>
                <li>Para cumprimento de obrigação legal ou regulatória</li>
                <li>Com autoridades competentes quando legalmente exigido</li>
                <li>Para proteção da vida ou segurança física</li>
                <li>Com prestadores de serviços sob rigorosos contratos de confidencialidade</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">6. Transferência Internacional</h3>
              <p>
                Quando necessário transferir dados para outros países, garantimos que o país de destino 
                oferece grau de proteção adequado ou implementamos salvaguardas apropriadas, como 
                cláusulas contratuais padrão aprovadas pela ANPD.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">7. Incidentes de Segurança</h3>
              <p className="mb-2">Em caso de incidente de segurança que possa acarretar risco aos titulares:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Notificaremos a ANPD em até 24 horas</li>
                <li>Comunicaremos os titulares afetados quando aplicável</li>
                <li>Implementaremos medidas para mitigar os danos</li>
                <li>Investigaremos as causas e implementaremos correções</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">8. Encarregado de Dados (DPO)</h3>
              <p>Nosso Encarregado de Proteção de Dados está disponível para:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Esclarecer dúvidas sobre tratamento de dados</li>
                <li>Receber e processar solicitações dos titulares</li>
                <li>Orientar sobre conformidade com a LGPD</li>
              </ul>
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p><strong>Contato do DPO:</strong></p>
                <p>E-mail: dpo@meunps.com</p>
                <p>Telefone: (11) 99999-9999</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">9. Reclamações</h3>
              <p>
                Se não ficar satisfeito com nossa resposta, você pode apresentar reclamação à 
                Autoridade Nacional de Proteção de Dados (ANPD) através do site: 
                <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-[#00ac75] hover:underline ml-1">
                  www.gov.br/anpd
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">10. Atualizações</h3>
              <p>
                Esta política pode ser atualizada para refletir mudanças na legislação ou em nossas práticas. 
                Notificaremos sobre alterações significativas e publicaremos a versão atualizada em nossa plataforma.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LegalModals;