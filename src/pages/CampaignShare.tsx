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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to={`/campaigns/${id}`}>
          <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
            Back to Campaign
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Share {campaign.name}</h1>
        <p className="text-gray-600 mt-1">
          Share your NPS survey with customers using these methods
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Direct Link" />
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <code className="text-sm break-all">{surveyUrl}</code>
            </div>
            <Button
              variant="outline"
              fullWidth
              icon={copied ? undefined : <Copy size={16} />}
              onClick={handleCopyLink}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Embed Code" />
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md mb-4 font-mono text-sm">
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
              Copy Embed Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="QR Code" />
          <CardContent>
            <div className="text-center">
              <Button
                variant="outline"
                icon={<QrCode size={16} />}
                onClick={() => setQrVisible(!qrVisible)}
              >
                {qrVisible ? 'Hide QR Code' : 'Show QR Code'}
              </Button>
              {qrVisible && (
                <div className="mt-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      surveyUrl
                    )}`}
                    alt="Survey QR Code"
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
}

export default CampaignShare