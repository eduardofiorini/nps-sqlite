import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Campaign } from '../types';
import { getCampaigns } from '../utils/localStorage';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ChevronLeft, Copy, Link as LinkIcon, QrCode } from 'lucide-react';

const CampaignShare: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    if (!id) return;

    const campaigns = getCampaigns();
    const foundCampaign = campaigns.find(c => c.id === id);
    setCampaign(foundCampaign || null);
  }, [id]);

  const surveyUrl = `${window.location.origin}/survey/${id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!campaign) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link to={`/campaigns/${id}`}>
          <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
            Voltar à Campanha
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compartilhar {campaign.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Compartilhe sua pesquisa NPS com clientes usando estes métodos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Link Direto" />
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
              <code className="text-sm break-all text-gray-900 dark:text-white">{surveyUrl}</code>
            </div>
            <Button
              variant="outline"
              fullWidth
              icon={copied ? undefined : <Copy size={16} />}
              onClick={handleCopyLink}
            >
              {copied ? 'Copiado!' : 'Copiar Link'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Código de Incorporação" />
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4 font-mono text-sm text-gray-900 dark:text-white">
              {`<iframe src="${surveyUrl}" width="100%" height="600" frameborder="0"></iframe>`}
            </div>
            <Button
              variant="outline"
              fullWidth
              icon={<LinkIcon size={16} />}
              onClick={() => {
                navigator.clipboard.writeText(
                  `<iframe src="${surveyUrl}" width="100%" height="600" frameborder="0"></iframe>`
                );
              }}
            >
              Copiar Código
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Código QR" />
          <CardContent>
            <div className="text-center">
              <Button
                variant="outline"
                icon={<QrCode size={16} />}
                onClick={() => setQrVisible(!qrVisible)}
              >
                {qrVisible ? 'Ocultar QR Code' : 'Mostrar QR Code'}
              </Button>
              {qrVisible && (
                <div className="mt-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      surveyUrl
                    )}`}
                    alt="QR Code da Pesquisa"
                    className="mx-auto"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignShare;