/*
  # Add unique constraint to campaign_forms table

  1. Changes
    - Add unique constraint on campaign_id column in campaign_forms table
    - This allows upsert operations to work correctly with ON CONFLICT

  2. Security
    - No changes to existing RLS policies
    - Maintains data integrity
*/

-- Add unique constraint to campaign_id column
ALTER TABLE campaign_forms ADD CONSTRAINT campaign_forms_campaign_id_unique UNIQUE (campaign_id);

-- Permitir leitura pública apenas para campanhas ativas
create policy "Allow public read for active campaigns"
on public.campaigns
for select
using (active = true);

-- Permitir leitura pública dos formulários dessas campanhas
create policy "Allow public read for campaign forms"
on public.campaign_forms
for select
using (exists (
  select 1 from public.campaigns c
  where c.id = campaign_id and c.active = true
));

-- Permitir leitura das situações (se forem sempre públicas)
create policy "Allow public read situations"
on public.situations
for select
using (true);

-- Permitir que usuários anônimos insiram respostas para campanhas públicas
create policy "Allow public insert for active campaigns"
on public.nps_responses
for insert
with check (
  exists (
    select 1
    from public.campaigns c
    where c.id = nps_responses.campaign_id
      and c.active = true
      and c.start_date <= now()
      and (c.end_date is null or c.end_date >= now())
  )
);

-- Policy de SELECT para retornar a resposta
create policy "Allow public select responses for public campaigns"
on public.nps_responses
for select
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = nps_responses.campaign_id
      and c.active = true
  )
);


-- drop policy "Allow anonymous insert for public campaigns" 
-- on public.nps_responses;