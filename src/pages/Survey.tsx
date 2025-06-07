import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Campaign, CampaignForm, NpsResponse } from '../types';
import { getCampaigns, getCampaignForm, saveResponse } from '../utils/localStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { getSources, getSituations, getGroups } from '../utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

const Survey: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignForm | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [sources] = useState(getSources());
  const [situations] = useState(getSituations());
  const [groups] = useState(getGroups());
  const { t } = useLanguage();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaign || !form) return;

    const npsField = form.fields.find(f => f.type === 'nps');
    if (!npsField || !formData[npsField.id]) return;

    const response: NpsResponse = {
      id: uuidv4(),
      campaignId: campaign.id,
      score: parseInt(formData[npsField.id], 10),
      feedback: formData['feedback'] || '',
      sourceId: sources[0]?.id || '',
      situationId: situations[0]?.id || '',
      groupId: groups[0]?.id || '',
      createdAt: new Date().toISOString(),
    };

    saveResponse(response);
    setSubmitted(true);
  };

  if (!campaign || !form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('survey.notFound')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('survey.notFoundDesc')}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
        <Card className="max-w-lg w-full">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t('survey.thankYou')}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('survey.submitted')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
      <Card className="max-w-lg w-full">
        <CardHeader title={campaign.name} />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field) => {
              if (field.type === 'nps') {
                return (
                  <div key={field.id} className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('survey.notLikely')}</span>
                      <div className="flex space-x-2">
                        {Array.from({ length: 11 }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`w-10 h-10 rounded-full border transition-colors ${
                              formData[field.id] === i
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300'
                            }`}
                            onClick={() => setFormData({ ...formData, [field.id]: i })}
                          >
                            {i}
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('survey.extremelyLikely')}</span>
                    </div>
                  </div>
                );
              }

              if (field.type === 'text') {
                return (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.label}
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={4}
                      value={formData[field.id] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      required={field.required}
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <Select
                    key={field.id}
                    label={field.label}
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    options={field.options?.map(opt => ({ value: opt, label: opt })) || []}
                    required={field.required}
                  />
                );
              }

              if (field.type === 'radio') {
                return (
                  <div key={field.id} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                    </label>
                    <div className="space-y-2">
                      {field.options?.map((option) => (
                        <label key={option} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={field.id}
                            value={option}
                            checked={formData[field.id] === option}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                            required={field.required}
                          />
                          <span className="text-gray-700 dark:text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }

              return null;
            })}

            <Button type="submit" variant="primary" fullWidth>
              {t('survey.submitFeedback')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Survey;