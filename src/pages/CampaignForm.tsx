import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Campaign, CampaignForm as CampaignFormType } from '../types';
import { getCampaigns, getCampaignForm } from '../utils/localStorage';
import FormBuilder from '../components/dashboard/FormBuilder';
import Button from '../components/ui/Button';
import { ChevronLeft } from 'lucide-react';

const CampaignForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignFormType | null>(null);

  useEffect(() => {
    if (!id) return;

    // Load campaign data
    const campaigns = getCampaigns();
    const foundCampaign = campaigns.find(c => c.id === id);
    setCampaign(foundCampaign || null);

    // Load form data
    const formData = getCampaignForm(id);
    setForm(formData);
  }, [id]);

  const handleSave = (updatedForm: CampaignFormType) => {
    // Navigate back to campaign dashboard after saving
    navigate(`/campaigns/${id}`);
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Form - {campaign.name}</h1>
        <p className="text-gray-600 mt-1">
          Customize your NPS survey form
        </p>
      </div>

      <FormBuilder
        initialForm={form}
        campaignId={id}
        onSave={handleSave}
      />
    </div>
  );
}

export default CampaignForm