import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FileText, Shield } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Termos de Uso e Política de Privacidade"
      size="xl"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onAccept}>
            Aceitar e Continuar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Terms of Service */}
        <div>
          <div className="flex items-center mb-4">
            <FileText size={20} className="text-[#073143] dark:text-white mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Termos de Uso
            </h3>
          </div>
          
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">1. Aceitação dos Termos</h4>
              <p>
                Ao acessar e usar a plataforma Meu NPS, você concorda em cumprir e estar vinculado a estes 
                Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">2. Descrição do Serviço</h4>
              <p>
                O Meu NPS é uma plataforma de gestão de Net Promoter Score (NPS) que permite criar campanhas, 
                coletar feedback de clientes, analisar dados e gerar relatórios para melhorar a experiência do cliente.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">3. Responsabilidades do Usuário</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Fornecer informações precisas e atualizadas durante o registro</li>
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Usar a plataforma apenas para fins legítimos e comerciais</li>
                <li>Não violar direitos de terceiros ou leis aplicáveis</li>
                <li>Respeitar os limites de uso do seu plano contratado</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">4. Propriedade Intelectual</h4>
              <p>
                Todos os direitos de propriedade intelectual da plataforma Meu NPS pertencem a nós. 
                Você mantém os direitos sobre os dados que inserir na plataforma, mas nos concede 
                licença para processá-los conforme necessário para fornecer nossos serviços.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">5. Limitação de Responsabilidade</h4>
              <p>
                Nossa responsabilidade é limitada ao valor pago pelos serviços. Não nos responsabilizamos 
                por danos indiretos, lucros cessantes ou perda de dados, exceto quando exigido por lei.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">6. Modificações</h4>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                Notificaremos sobre mudanças significativas e o uso continuado constitui aceitação dos novos termos.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center mb-4">
            <Shield size={20} className="text-[#00ac75] dark:text-white mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Política de Privacidade
            </h3>
          </div>
          
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">1. Coleta de Informações</h4>
              <p>
                Coletamos informações que você nos fornece diretamente (nome, e-mail, dados da empresa) 
                e informações de uso da plataforma (logs de acesso, preferências, dados de campanhas NPS).
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">2. Uso das Informações</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar pagamentos e gerenciar sua conta</li>
                <li>Enviar comunicações importantes sobre o serviço</li>
                <li>Analisar uso da plataforma para melhorias</li>
                <li>Cumprir obrigações legais e regulamentares</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">3. Compartilhamento de Dados</h4>
              <p>
                Não vendemos seus dados pessoais. Compartilhamos informações apenas com:
                provedores de serviços essenciais (hospedagem, pagamentos), quando exigido por lei, 
                ou com seu consentimento explícito.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">4. Segurança</h4>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, 
                incluindo criptografia, controles de acesso e monitoramento de segurança.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">5. Seus Direitos</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Acessar e corrigir seus dados pessoais</li>
                <li>Solicitar exclusão de seus dados</li>
                <li>Portabilidade de dados</li>
                <li>Retirar consentimento a qualquer momento</li>
                <li>Apresentar reclamações às autoridades competentes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">6. Retenção de Dados</h4>
              <p>
                Mantemos seus dados pelo tempo necessário para fornecer os serviços e cumprir 
                obrigações legais. Dados de campanhas encerradas são mantidos por até 5 anos 
                para fins de auditoria e conformidade.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">7. Cookies</h4>
              <p>
                Utilizamos cookies essenciais para funcionamento da plataforma e cookies de 
                análise para melhorar a experiência. Você pode gerenciar preferências de 
                cookies nas configurações do seu navegador.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">8. Contato</h4>
              <p>
                Para questões sobre privacidade ou exercer seus direitos, entre em contato 
                conosco através do e-mail: privacidade@meunps.com ou pelo telefone: (11) 99999-9999.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Última atualização: Janeiro de 2025
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default TermsModal;