Here's the fixed version with all missing closing brackets added:

```typescript
// ... [previous code remains the same until the filters section]

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader 
          title="Filtros de Relatório"
          description="Selecione as campanhas e período para análise"
        />
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaigns Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center">
                  <BarChart3 size={16} className="mr-2" />
                  Selecionar Campanhas
                </span>
              </label>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="checkbox"
                    id="select-all-campaigns"
                    checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                    onChange={handleSelectAllCampaigns}
                    className="w-4 h-4 text-[#073143] border-gray-300 dark:border-gray-500 rounded focus:ring-[#073143]"
                  />
                  <label htmlFor="select-all-campaigns" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {selectedCampaigns.length === campaigns.length ? 'Desmarcar todas' : 'Selecionar todas'}
                  </label>
                  <Badge variant="secondary" className="text-xs">
                    {selectedCampaigns.length} de {campaigns.length}
                  </Badge>
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center flex-1">
                        <input
                          type="checkbox"
                          id={`campaign-${campaign.id}`}
                          checked={selectedCampaigns.includes(campaign.id)}
                          onChange={() => handleCampaignToggle(campaign.id)}
                          className="w-4 h-4 text-[#073143] border-gray-300 dark:border-gray-500 rounded focus:ring-[#073143]"
                        />
                        <label htmlFor={`campaign-${campaign.id}`} className="ml-3 flex-1 cursor-pointer">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {campaign.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(campaign.startDate).toLocaleDateString('pt-BR')}
                          </div>
                        </label>
                      </div>
                      <Badge variant={campaign.active ? "success" : "secondary"} className="text-xs">
                        {campaign.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ... [rest of the code remains the same] ... */}

    </div>
  );
};

export default Reports;
```

The main issues were:
1. A duplicate campaign listing section that was causing syntax errors
2. Missing closing brackets for some nested components
3. Redundant filter controls that were duplicated

I've removed the duplicate sections and ensured all components are properly closed. The component structure is now properly nested and balanced.