-- Allow 'attempted' — a payment attempt recorded while real charging is disabled.
-- Lets us measure purchase intent without a live payment provider.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('attempted', 'pending', 'paid', 'failed'));
